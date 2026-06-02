import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient() as any
    const { data: usuario } = await admin.from('usuarios').select('escola_id, role').eq('id', user.id).single()
    if (!usuario) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

    const { data: colab } = await admin
      .from('colaboradores')
      .select('nome,email,telefone,cpf,cargo,dt_admissao,salario,cep,rua,numero,bairro,cidade,estado,observacoes')
      .eq('escola_id', usuario.escola_id)
      .order('nome')

    const linhas = [
      'nome,email,telefone,cpf,cargo,dt_admissao,salario,cep,rua,numero,bairro,cidade,estado,observacoes',
      ...(colab ?? []).map((c: any) => [
        csv(c.nome), csv(c.email ?? ''), csv(c.telefone ?? ''), csv(c.cpf ?? ''),
        csv(c.cargo), csv(c.dt_admissao ?? ''), csv(c.salario != null ? String(c.salario) : ''),
        csv(c.cep ?? ''), csv(c.rua ?? ''), csv(c.numero ?? ''),
        csv(c.bairro ?? ''), csv(c.cidade ?? ''), csv(c.estado ?? ''),
        csv(c.observacoes ?? ''),
      ].join(','))
    ]

    return new NextResponse(linhas.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="colaboradores.csv"',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function csv(v: string) {
  if (!v) return ''
  return v.includes(',') || v.includes('"') || v.includes('\n')
    ? `"${v.replace(/"/g, '""')}"` : v
}
