import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PrintFinanceiroPage({
  searchParams,
}: { searchParams: { mes?: string; ano?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id').eq('id', user.id).single()
  const escolaId = usuario?.escola_id

  const hoje = new Date()
  const mes  = parseInt(searchParams.mes ?? String(hoje.getMonth() + 1))
  const ano  = parseInt(searchParams.ano ?? String(hoje.getFullYear()))
  const mesRef = `${ano}-${String(mes).padStart(2,'0')}`
  const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const { data: config } = await admin.from('configuracoes_escola')
    .select('nome_fantasia, cidade, estado').eq('escola_id', escolaId).maybeSingle()
  const { data: escola } = await admin.from('escolas').select('nome').eq('id', escolaId).single()
  const nomeEscola = config?.nome_fantasia || escola?.nome || 'Escola'

  const { data: alunos } = await admin.from('alunos')
    .select('id, nome, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId).eq('status', 'ativo').order('nome')

  const { data: mensalidades } = await admin.from('mensalidades')
    .select('*').eq('escola_id', escolaId).eq('mes_referencia', mesRef)

  const mensMap: Record<string, any> = {}
  for (const m of (mensalidades ?? [])) mensMap[m.aluno_id] = m

  function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

  const lista = (alunos ?? []).map((a: any) => ({
    ...a, turma: a.alunos_turmas?.[0]?.turma?.nome ?? '—', mensalidade: mensMap[a.id] ?? null,
  }))

  const pagos    = lista.filter((a: any) => a.mensalidade?.status === 'pago')
  const vencidos = lista.filter((a: any) => a.mensalidade?.status === 'vencido')
  const pendentes= lista.filter((a: any) => a.mensalidade?.status === 'pendente')
  const isentos  = lista.filter((a: any) => a.mensalidade?.status === 'isento')
  const semCob   = lista.filter((a: any) => !a.mensalidade)

  const totalRecebido = pagos.reduce((s: number, a: any) => s + (a.mensalidade?.valor ?? 0), 0)
  const totalVencido  = vencidos.reduce((s: number, a: any) => s + (a.mensalidade?.valor ?? 0), 0)
  const totalPendente = pendentes.reduce((s: number, a: any) => s + (a.mensalidade?.valor ?? 0), 0)

  return (
    <html lang="pt-BR">
      <head>
        <title>Financeiro {MESES[mes]}/{ano} — {nomeEscola}</title>
        <meta charSet="utf-8" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; }
          .page { padding: 20px 24px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d97706; padding-bottom: 12px; margin-bottom: 16px; }
          .escola-nome { font-size: 16px; font-weight: 900; }
          .escola-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }
          .titulo      { font-size: 13px; font-weight: 700; color: #d97706; }
          .kpi-grid    { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; margin-bottom: 16px; }
          .kpi-box     { border-radius: 8px; padding: 8px 10px; }
          .kpi-val     { font-size: 14px; font-weight: 900; }
          .kpi-lbl     { font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
          .section-title { font-size: 11px; font-weight: 900; padding: 6px 10px; margin: 12px 0 4px; border-left: 3px solid; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #f8fafc; font-size: 9px; text-transform: uppercase; color: #64748b; padding: 5px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          td { padding: 5px 8px; border-bottom: 1px solid #f1f5f9; }
          tr:nth-child(even) td { background: #f8fafc; }
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
              <div className="titulo">Relatório Financeiro — {MESES[mes]}/{ano}</div>
              <div className="escola-sub">Emitido em {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-box" style={{ background: '#f0fdf4' }}>
              <div className="kpi-val" style={{ color: '#15803d' }}>{fmt(totalRecebido)}</div>
              <div className="kpi-lbl" style={{ color: '#16a34a' }}>✓ Recebido ({pagos.length})</div>
            </div>
            <div className="kpi-box" style={{ background: '#fef2f2' }}>
              <div className="kpi-val" style={{ color: '#b91c1c' }}>{fmt(totalVencido)}</div>
              <div className="kpi-lbl" style={{ color: '#dc2626' }}>⚠ Vencido ({vencidos.length})</div>
            </div>
            <div className="kpi-box" style={{ background: '#fffbeb' }}>
              <div className="kpi-val" style={{ color: '#b45309' }}>{fmt(totalPendente)}</div>
              <div className="kpi-lbl" style={{ color: '#d97706' }}>⏱ Pendente ({pendentes.length})</div>
            </div>
            <div className="kpi-box" style={{ background: '#f8fafc' }}>
              <div className="kpi-val" style={{ color: '#475569' }}>{semCob.length + isentos.length}</div>
              <div className="kpi-lbl" style={{ color: '#64748b' }}>Sem cobrança/isento</div>
            </div>
          </div>

          {pagos.length > 0 && (
            <>
              <div className="section-title" style={{ color: '#15803d', borderColor: '#16a34a', background: '#f0fdf4' }}>
                Pagamentos Recebidos — {pagos.length} aluno{pagos.length !== 1 ? 's' : ''}
              </div>
              <table>
                <thead><tr><th>Aluno</th><th>Turma</th><th>Valor</th><th>Pagamento</th><th>Forma</th></tr></thead>
                <tbody>
                  {pagos.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.nome}</td><td>{a.turma}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(a.mensalidade.valor)}</td>
                      <td>{a.mensalidade.dt_pagamento?.split('-').reverse().join('/') ?? '—'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{a.mensalidade.forma_pagamento ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {vencidos.length > 0 && (
            <>
              <div className="section-title" style={{ color: '#b91c1c', borderColor: '#dc2626', background: '#fef2f2' }}>
                Vencidos — {vencidos.length} aluno{vencidos.length !== 1 ? 's' : ''} · {fmt(totalVencido)}
              </div>
              <table>
                <thead><tr><th>Aluno</th><th>Turma</th><th>Valor</th><th>Vencimento</th><th>Dias atraso</th></tr></thead>
                <tbody>
                  {vencidos.map((a: any) => {
                    const venc = a.mensalidade.dt_vencimento ? new Date(a.mensalidade.dt_vencimento + 'T00:00:00') : null
                    const dias = venc ? Math.floor((Date.now() - venc.getTime()) / 86400000) : null
                    return (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.nome}</td><td>{a.turma}</td>
                        <td style={{ fontWeight: 700 }}>{fmt(a.mensalidade.valor)}</td>
                        <td>{a.mensalidade.dt_vencimento?.split('-').reverse().join('/') ?? '—'}</td>
                        <td style={{ color: '#dc2626', fontWeight: 700 }}>{dias !== null ? `${dias}d` : '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </>
          )}

          {pendentes.length > 0 && (
            <>
              <div className="section-title" style={{ color: '#b45309', borderColor: '#d97706', background: '#fffbeb' }}>
                Pendentes — {pendentes.length} aluno{pendentes.length !== 1 ? 's' : ''}
              </div>
              <table>
                <thead><tr><th>Aluno</th><th>Turma</th><th>Valor</th><th>Vencimento</th></tr></thead>
                <tbody>
                  {pendentes.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 600 }}>{a.nome}</td><td>{a.turma}</td>
                      <td style={{ fontWeight: 700 }}>{fmt(a.mensalidade.valor)}</td>
                      <td>{a.mensalidade.dt_vencimento?.split('-').reverse().join('/') ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          <div className="footer">Gerado pelo EduNest — Sistema de Gestão Escolar</div>
        </div>
      </body>
    </html>
  )
}
