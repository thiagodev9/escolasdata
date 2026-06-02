import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const { turmas }: { turmas: string[] } = await request.json()
    if (!turmas?.length) return NextResponse.json({ error: 'Nenhuma turma' }, { status: 400 })

    // Buscar turmas existentes para evitar duplicatas
    const { data: existentes } = await (admin as any)
      .from('turmas')
      .select('nome')
      .eq('escola_id', usuario.escola_id) as { data: { nome: string }[] | null }

    const existentesSet = new Set((existentes ?? []).map(t => t.nome.toLowerCase()))
    const novas = turmas.filter(n => !existentesSet.has(n.toLowerCase()))

    if (novas.length > 0) {
      await (admin as any).from('turmas').insert(
        novas.map(nome => ({
          nome,
          escola_id:  usuario.escola_id,
          capacidade: 25,
          ano_letivo: new Date().getFullYear(),
        }))
      )
    }

    return NextResponse.json({ criadas: novas.length, ignoradas: turmas.length - novas.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
