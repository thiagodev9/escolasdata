import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient() as any
    const { data: usuario } = await admin.from('usuarios').select('escola_id, role').eq('id', user.id).single()
    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role))
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { rows } = await request.json()
    if (!rows?.length) return NextResponse.json({ error: 'Nenhuma linha.' }, { status: 400 })

    let criados = 0, erros = 0

    for (const row of rows) {
      try {
        if (!row.nome?.trim()) { erros++; continue }
        await admin.from('colaboradores').insert({
          escola_id:    usuario.escola_id,
          nome:         row.nome?.trim(),
          email:        row.email?.trim() || null,
          telefone:     row.telefone?.trim() || null,
          cpf:          row.cpf?.trim() || null,
          cargo:        row.cargo?.trim() || 'outro',
          dt_admissao:  normalizarData(row.dt_admissao) || null,
          salario:      row.salario ? parseFloat(row.salario.replace(',', '.')) : null,
          cep:          row.cep?.trim() || null,
          rua:          row.rua?.trim() || null,
          numero:       row.numero?.trim() || null,
          bairro:       row.bairro?.trim() || null,
          cidade:       row.cidade?.trim() || null,
          estado:       row.estado?.trim() || null,
          observacoes:  row.observacoes?.trim() || null,
          ativo:        true,
        })
        criados++
      } catch (rowErr: any) {
        console.error(`[importar-colaboradores] erro na linha "${row.nome}":`, rowErr?.message)
        erros++
      }
    }

    return NextResponse.json({ criados, erros })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function normalizarData(s: string): string {
  if (!s) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const [d, m, y] = s.split('/')
  if (y && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  return ''
}
