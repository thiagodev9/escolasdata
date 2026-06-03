import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PrintAlunosPage({ searchParams }: { searchParams: { turma?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id').eq('id', user.id).single()
  const escolaId = usuario?.escola_id

  const { data: config } = await admin.from('configuracoes_escola')
    .select('nome_fantasia, logo_url, cidade, estado, telefone')
    .eq('escola_id', escolaId).maybeSingle()

  const { data: escola } = await admin.from('escolas').select('nome').eq('id', escolaId).single()
  const nomeEscola = config?.nome_fantasia || escola?.nome || 'Escola'

  const { data: alunos } = await admin.from('alunos')
    .select('id, nome, dt_nascimento, status, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId)
    .eq('status', 'ativo')
    .order('nome')

  const turmaParam = searchParams.turma
  const filtrados = turmaParam
    ? (alunos ?? []).filter((a: any) => a.alunos_turmas?.[0]?.turma?.nome === turmaParam)
    : (alunos ?? [])

  const porTurma: Record<string, any[]> = {}
  for (const a of filtrados) {
    const t = a.alunos_turmas?.[0]?.turma?.nome ?? 'Sem Turma'
    if (!porTurma[t]) porTurma[t] = []
    porTurma[t].push(a)
  }

  const hoje = new Date().toLocaleDateString('pt-BR')

  function calcIdade(dt: string) {
    if (!dt) return ''
    const n = new Date(dt + 'T00:00:00')
    const d = new Date()
    let years = d.getFullYear() - n.getFullYear()
    if (d.getMonth() < n.getMonth() || (d.getMonth() === n.getMonth() && d.getDate() < n.getDate())) years--
    return `${years} ano${years !== 1 ? 's' : ''}`
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Lista de Alunos — {nomeEscola}</title>
        <meta charSet="utf-8" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; }
          .page { padding: 20px 24px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 16px; }
          .escola-nome { font-size: 16px; font-weight: 900; color: #1e293b; }
          .escola-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }
          .titulo      { font-size: 13px; font-weight: 700; color: #2563EB; }
          .turma-header { background: #EFF6FF; padding: 6px 10px; font-weight: 900; font-size: 12px; color: #1e40af; margin: 12px 0 4px; border-left: 3px solid #2563EB; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8fafc; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 5px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
          tr:nth-child(even) td { background: #f8fafc; }
          .assinatura { width: 120px; border-bottom: 1px solid #94a3b8; height: 14px; }
          .footer { margin-top: 20px; font-size: 9px; color: #94a3b8; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          .total { font-size: 10px; color: #64748b; text-align: right; margin-top: 4px; }
          @media print { @page { margin: 15mm; } }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="header">
            <div>
              <div className="escola-nome">{nomeEscola}</div>
              <div className="escola-sub">{config?.cidade && config?.estado ? `${config.cidade} — ${config.estado}` : ''} {config?.telefone ? `| ${config.telefone}` : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="titulo">Lista de Alunos{turmaParam ? ` — ${turmaParam}` : ''}</div>
              <div className="escola-sub">Emitido em {hoje}</div>
            </div>
          </div>

          {Object.entries(porTurma).sort(([a],[b]) => a.localeCompare(b)).map(([turma, lista]) => (
            <div key={turma}>
              <div className="turma-header">{turma} — {lista.length} aluno{lista.length !== 1 ? 's' : ''}</div>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}>#</th>
                    <th>Nome do Aluno</th>
                    <th>Nascimento</th>
                    <th>Idade</th>
                    <th style={{ width: '140px' }}>Assinatura</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((a: any, i: number) => (
                    <tr key={a.id}>
                      <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{a.nome}</td>
                      <td>{a.dt_nascimento ? a.dt_nascimento.split('-').reverse().join('/') : '—'}</td>
                      <td style={{ color: '#64748b' }}>{calcIdade(a.dt_nascimento)}</td>
                      <td><div className="assinatura" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="total">Total geral: {filtrados.length} aluno{filtrados.length !== 1 ? 's' : ''}</div>
          <div className="footer">Gerado pelo KTX Academy — Sistema de Gestão Escolar</div>
        </div>
      </body>
    </html>
  )
}
