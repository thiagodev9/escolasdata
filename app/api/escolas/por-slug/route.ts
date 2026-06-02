import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug obrigatório' }, { status: 400 })

  const admin = createClient()
  const { data } = await (admin as any)
    .from('escolas')
    .select('id, nome, slug')
    .eq('slug', slug)
    .eq('ativo', true)
    .single() as { data: { id: string; nome: string; slug: string } | null }

  if (!data) return NextResponse.json({ error: 'Escola não encontrada.' }, { status: 404 })
  return NextResponse.json(data)
}
