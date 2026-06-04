import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { nome, nomeEscola, email, senha } = await req.json()

    if (!nome?.trim() || !nomeEscola?.trim() || !email?.trim() || !senha?.trim()) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
    }
    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 })
    }

    const admin = createClient()

    // Cria usuário no Supabase Auth (já confirmado — sem email de verificação)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email:          email.trim().toLowerCase(),
      password:       senha,
      email_confirm:  true,
    })
    if (authError) {
      const msg = authError.message.includes('already registered')
        ? 'Este e-mail já está cadastrado.'
        : authError.message
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const userId = authData.user.id

    // Cria a escola
    const { data: escola, error: escolaError } = await (admin as any)
      .from('escolas')
      .insert({ nome: nomeEscola.trim(), slug: slugify(nomeEscola.trim()) })
      .select('id')
      .single() as { data: { id: string } | null; error: any }

    if (escolaError || !escola) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erro ao criar escola. Tente novamente.' }, { status: 500 })
    }

    // Cria o registro do usuário na tabela usuarios
    const { error: usuarioError } = await (admin as any)
      .from('usuarios')
      .insert({
        id:        userId,
        escola_id: escola.id,
        nome:      nome.trim(),
        email:     email.trim().toLowerCase(),
        role:      'diretora',
      })

    if (usuarioError) {
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: 'Erro ao criar usuário. Tente novamente.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}
