import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const admin = createAdmin() as any
    const { data: me } = await admin.from('usuarios').select('role').eq('id', user.id).single()
    if (me?.role !== 'super_admin') return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })

    const { nome, email, senha, role, escola_id } = await req.json()
    if (!nome || !email || !senha || !role || !escola_id)
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })

    // 1. Cria usuário no Supabase Auth
    const { data: authUser, error: authErr } = await admin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true,
    })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 400 })

    // 2. Cria registro na tabela usuarios
    const { error: dbErr } = await admin.from('usuarios').insert({
      id:        authUser.user.id,
      escola_id,
      nome:      nome.trim(),
      email:     email.trim().toLowerCase(),
      role,
      ativo:     true,
    })
    if (dbErr) {
      // Rollback: remove auth user se falhar no DB
      await admin.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json({ error: dbErr.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, id: authUser.user.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
