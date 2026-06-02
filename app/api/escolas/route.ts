import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

// POST — criar nova escola (super_admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('role').eq('id', user.id).single() as { data: { role: string } | null }

    if (usuario?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Apenas super_admin pode criar escolas.' }, { status: 403 })
    }

    const { nome, slug, plano = 'basico' } = await request.json()
    if (!nome?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'nome e slug são obrigatórios.' }, { status: 400 })
    }

    const { data, error } = await (admin as any)
      .from('escolas')
      .insert({ nome: nome.trim(), slug: slug.trim().toLowerCase(), plano })
      .select('id, nome, slug')
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET — listar todas as escolas (super_admin)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('role').eq('id', user.id).single() as { data: { role: string } | null }

    if (usuario?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { data } = await (admin as any)
      .from('escolas')
      .select('*, usuarios(count), alunos(count)')
      .order('criado_em', { ascending: false })

    return NextResponse.json(data ?? [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
