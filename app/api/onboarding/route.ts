import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

// PATCH /api/onboarding — salva perfil da escola
export async function PATCH(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios')
      .select('escola_id, role')
      .eq('id', user.id)
      .single() as { data: { escola_id: string; role: string } | null }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { cnpj, telefone, endereco, logo_url, onboarding_completo } = body

    const { error } = await (admin as any)
      .from('escolas')
      .update({ cnpj, telefone, endereco, logo_url, onboarding_completo })
      .eq('id', usuario.escola_id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
