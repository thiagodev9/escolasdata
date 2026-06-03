import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('escola_id, role').eq('id', user.id).single() as { data: { escola_id: string; role: string } | null }

    // 🔐 Apenas diretora/super_admin podem ler config NFS-e (contém chave de API)
    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { data } = await (admin as any)
      .from('nfse_config').select('*').eq('escola_id', usuario.escola_id).maybeSingle()

    return NextResponse.json(data ?? null)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('escola_id, role').eq('id', user.id).single() as { data: { escola_id: string; role: string } | null }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const body = await request.json()
    const { error } = await (admin as any)
      .from('nfse_config')
      .upsert({
        escola_id:          usuario.escola_id,
        prestador_cnpj:     body.prestador_cnpj    ?? null,
        prestador_im:       body.prestador_im      ?? null,
        regime_tributario:  body.regime_tributario ?? 'simples',
        iss_aliquota:       body.iss_aliquota      ?? 5.00,
        codigo_servico:     body.codigo_servico    ?? '8.01',
        municipio_ibge:     body.municipio_ibge    ?? null,
        municipio_nome:     body.municipio_nome    ?? null,
        ambiente:           body.ambiente          ?? 'homologacao',
        nfeio_api_key:      body.nfeio_api_key     ?? null,
        atualizado_em:      new Date().toISOString(),
      }, { onConflict: 'escola_id' })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
