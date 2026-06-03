import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PrintFrequenciaPage({
  searchParams,
}: { searchParams: { mes?: string; ano?: string; turma?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id').eq('id', user.id).single()
  const escolaId = usuario?.escola_id

  const hoje = new Date()
  const mes  = parseInt(searchParams.mes  ?? String(hoje.getMonth() + 1))
  const ano  = parseInt(searchParams.ano  ?? String(hoje.getFullYear()))
  const turmaFiltro = searchParams.turma ?? ''

  const { data: config } = await admin.from('configuracoes_escola')
    .select('nome_fantasia, cidade, estado').eq('escola_id', escolaId).maybeSingle()
  const { data: escola } = await admin.from('escolas').select('nome').eq('id', escolaId).single()
  const nomeEscola = config?.nome_fantasia || escola?.nome || 'Escola'

  const mesStr = `${ano}-${String(mes).padStart(2,'0')}`
  const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const { data: alunos } = await admin.from('alunos')
    .select('id, nome, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId).eq('status', 'ativo').order('nome')

  const filtrados = turmaFiltro
    ? (alunos ?? []).filter((a: any) => a.alunos_turmas?.[0]?.turma?.nome === turmaFiltro)
    : (alunos ?? [])

  const { data: presencas } = await admin.from('presencas')
    .select('aluno_id, presente, data')
    .eq('escola_id', escolaId)
    .gte('data', `${mesStr}-01`)
    .lte('data', `${mesStr}-31`)

  const diasSet = new Set<string>()
  for (const p of (presencas ?? [])) diasSet.add(p.data)
  const totalDias = diasSet.size || 1

  const presMap: Record<string, { presentes: number; faltas: number }> = {}
  for (const p of (presencas ?? [])) {
    if (!presMap[p.aluno_id]) presMap[p.aluno_id] = { presentes: 0, faltas: 0 }
    if (p.presente) presMap[p.aluno_id].presentes++
    else presMap[p.aluno_id].faltas++
  }

  const porTurma: Record<string, any[]> = {}
  for (const a of filtrados) {
    const t = a.alunos_turmas?.[0]?.turma?.nome ?? 'Sem Turma'
    if (!porTurma[t]) porTurma[t] = []
    porTurma[t].push(a)
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Frequência {MESES[mes]}/{ano} — {nomeEscola}</title>
        <meta charSet="utf-8" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; }
          .page { padding: 20px 24px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #16a34a; padding-bottom: 12px; margin-bottom: 16px; }
          .escola-nome { font-size: 16px; font-weight: 900; }
          .escola-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }
          .titulo      { font-size: 13px; font-weight: 700; color: #16a34a; }
          .turma-header { background: #f0fdf4; padding: 6px 10px; font-weight: 900; font-size: 12px; color: #15803d; margin: 12px 0 4px; border-left: 3px solid #16a34a; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8fafc; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; padding: 5px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
          tr:nth-child(even) td { background: #f8fafc; }
          .bar-bg { background: #e2e8f0; border-radius: 3px; height: 8px; width: 80px; display: inline-block; overflow: hidden; }
          .bar-fill { height: 8px; border-radius: 3px; }
          .footer { margin-top: 20px; font-size: 9px; color: #94a3b8; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 8px; }
          @media print { @page { margin: 15mm; } }
        `}</style>
      </head>
      <body>
        <div className="page">
          <div className="header">
            <div>
              <div className="escola-nome">{nomeEscola}</div>
              <div className="escola-sub">{config?.cidade && config?.estado ? `${config.cidade} — ${config.estado}` : ''}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="titulo">Frequência — {MESES[mes]}/{ano}</div>
              <div className="escola-sub">{totalDias} dia(s) letivo(s) · Emitido em {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          {Object.entries(porTurma).sort(([a],[b]) => a.localeCompare(b)).map(([turma, lista]) => {
            const mediaFreq = lista.reduce((s, a) => {
              const p = presMap[a.id]; if (!p) return s
              return s + (p.presentes / (p.presentes + p.faltas)) * 100
            }, 0) / (lista.filter(a => presMap[a.id]).length || 1)
            return (
              <div key={turma}>
                <div className="turma-header">
                  {turma} — {lista.length} aluno{lista.length !== 1 ? 's' : ''}
                  {!isNaN(mediaFreq) ? ` · Média: ${Math.round(mediaFreq)}%` : ''}
                </div>
                <table>
                  <thead><tr><th>#</th><th>Nome</th><th>Presenças</th><th>Faltas</th><th>% Frequência</th><th>Situação</th></tr></thead>
                  <tbody>
                    {lista.map((a: any, i: number) => {
                      const p = presMap[a.id] ?? { presentes: 0, faltas: 0 }
                      const total = p.presentes + p.faltas
                      const pct = total > 0 ? Math.round(p.presentes / total * 100) : null
                      const cor = pct === null ? '#94a3b8' : pct >= 75 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626'
                      return (
                        <tr key={a.id}>
                          <td style={{ color: '#94a3b8' }}>{i+1}</td>
                          <td style={{ fontWeight: 600 }}>{a.nome}</td>
                          <td style={{ color: '#16a34a', fontWeight: 700 }}>{total > 0 ? p.presentes : '—'}</td>
                          <td style={{ color: p.faltas > 0 ? '#dc2626' : '#94a3b8' }}>{total > 0 ? p.faltas : '—'}</td>
                          <td>
                            {pct !== null ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontWeight: 700, color: cor, minWidth: 32 }}>{pct}%</span>
                                <span className="bar-bg"><span className="bar-fill" style={{ width: `${pct}%`, background: cor }} /></span>
                              </div>
                            ) : <span style={{ color: '#94a3b8' }}>—</span>}
                          </td>
                          <td style={{ color: cor, fontWeight: 600 }}>
                            {pct === null ? '—' : pct >= 75 ? 'Regular' : pct >= 60 ? 'Atenção' : 'Crítico'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )
          })}

          <div className="footer">Gerado pelo KTX Academy — Sistema de Gestão Escolar</div>
        </div>
      </body>
    </html>
  )
}
