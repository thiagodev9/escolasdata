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

    const { data: alunos } = await admin
      .from('alunos')
      .select(`nome, dt_nascimento, status,
        alunos_turmas(turma:turmas(nome)),
        alunos_responsaveis(principal, responsaveis(nome, telefone, email))`)
      .eq('escola_id', usuario.escola_id)
      .order('nome')

    const linhas = [
      'nome,nascimento,turma,status,responsavel,telefone,email_responsavel',
      ...(alunos ?? []).map((a: any) => {
        const turma = a.alunos_turmas?.[0]?.turma?.nome ?? ''
        const resp  = (a.alunos_responsaveis ?? []).find((r: any) => r.principal) ?? a.alunos_responsaveis?.[0]
        return [
          csv(a.nome), csv(a.dt_nascimento ?? ''), csv(turma), csv(a.status),
          csv(resp?.responsaveis?.nome ?? ''),
          csv(resp?.responsaveis?.telefone ?? ''),
          csv(resp?.responsaveis?.email ?? ''),
        ].join(',')
      })
    ]

    return new NextResponse(linhas.join('\n'), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="alunos.csv"',
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
