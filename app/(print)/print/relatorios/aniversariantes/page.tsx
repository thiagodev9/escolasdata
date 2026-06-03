import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PrintAniversariantesPage({
  searchParams,
}: { searchParams: { mes?: string } }) {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id').eq('id', user.id).single()
  const escolaId = usuario?.escola_id

  const hoje = new Date()
  const mes  = parseInt(searchParams.mes ?? String(hoje.getMonth() + 1))
  const MESES = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

  const { data: config } = await admin.from('configuracoes_escola')
    .select('nome_fantasia, cidade, estado').eq('escola_id', escolaId).maybeSingle()
  const { data: escola } = await admin.from('escolas').select('nome').eq('id', escolaId).single()
  const nomeEscola = config?.nome_fantasia || escola?.nome || 'Escola'

  const mesPad = String(mes).padStart(2, '0')

  const { data: alunos } = await admin.from('alunos')
    .select('id, nome, dt_nascimento, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId).eq('status', 'ativo')

  const { data: colab } = await admin.from('colaboradores')
    .select('id, nome, cargo, dt_nascimento')
    .eq('escola_id', escolaId).eq('ativo', true)

  const alunosAniv = (alunos ?? [])
    .filter((a: any) => a.dt_nascimento?.slice(5,7) === mesPad)
    .sort((a: any, b: any) => parseInt(a.dt_nascimento.slice(8,10)) - parseInt(b.dt_nascimento.slice(8,10)))

  const colabAniv = (colab ?? [])
    .filter((c: any) => c.dt_nascimento?.slice(5,7) === mesPad)
    .sort((a: any, b: any) => parseInt(a.dt_nascimento.slice(8,10)) - parseInt(b.dt_nascimento.slice(8,10)))

  function calcIdade(dt: string) {
    const n = new Date(dt + 'T00:00:00'), d = new Date()
    let y = d.getFullYear() - n.getFullYear()
    if (d.getMonth() < n.getMonth() || (d.getMonth() === n.getMonth() && d.getDate() < n.getDate())) y--
    const mn = parseInt(dt.slice(5,7))
    if (mn > d.getMonth() + 1) y++
    else if (mn === d.getMonth() + 1 && parseInt(dt.slice(8,10)) > d.getDate()) y++
    return y
  }

  const CARGO_LABEL: Record<string,string> = {
    diretora:'Diretora', coordenadora:'Coordenadora', professora:'Professora',
    auxiliar_classe:'Aux. de Classe', monitora:'Monitora', auxiliar_admin:'Aux. Admin',
    cozinheira:'Cozinheira', faxineira:'Faxineira', porteiro:'Porteiro',
    psicologa:'Psicóloga', fonoaudiologa:'Fonoaudióloga', outro:'Outro',
  }

  return (
    <html lang="pt-BR">
      <head>
        <title>Aniversariantes {MESES[mes]} — {nomeEscola}</title>
        <meta charSet="utf-8" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; background: white; }
          .page { padding: 20px 24px; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #db2777; padding-bottom: 12px; margin-bottom: 16px; }
          .escola-nome { font-size: 16px; font-weight: 900; }
          .escola-sub  { font-size: 10px; color: #64748b; margin-top: 2px; }
          .titulo      { font-size: 13px; font-weight: 700; color: #db2777; }
          .section-title { font-size: 11px; font-weight: 900; padding: 6px 10px; margin: 12px 0 4px; border-left: 3px solid; }
          .cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin: 8px 0; }
          .card { border: 1px solid #fce7f3; border-radius: 8px; padding: 10px; text-align: center; background: #fdf2f8; }
          .card-day  { font-size: 28px; font-weight: 900; color: #db2777; line-height: 1; }
          .card-name { font-size: 11px; font-weight: 700; margin-top: 3px; }
          .card-sub  { font-size: 9px; color: #9d174d; margin-top: 2px; }
          .card-colab { background: #f0f9ff; border-color: #bae6fd; }
          .card-colab .card-day { color: #0369a1; }
          .card-colab .card-sub { color: #0369a1; }
          .empty { padding: 16px; text-align: center; color: #94a3b8; font-size: 10px; }
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
              <div className="titulo">🎂 Aniversariantes de {MESES[mes]}</div>
              <div className="escola-sub">Emitido em {new Date().toLocaleDateString('pt-BR')}</div>
            </div>
          </div>

          <div className="section-title" style={{ color: '#9d174d', borderColor: '#db2777', background: '#fdf2f8' }}>
            Alunos — {alunosAniv.length} aniversariante{alunosAniv.length !== 1 ? 's' : ''}
          </div>
          {alunosAniv.length === 0
            ? <div className="empty">Nenhum aluno faz aniversário em {MESES[mes]}.</div>
            : <div className="cards">
                {alunosAniv.map((a: any) => (
                  <div key={a.id} className="card">
                    <div className="card-day">{a.dt_nascimento.slice(8,10)}</div>
                    <div className="card-name">{a.nome}</div>
                    <div className="card-sub">
                      {a.alunos_turmas?.[0]?.turma?.nome ?? '—'} · {calcIdade(a.dt_nascimento)} ano{calcIdade(a.dt_nascimento) !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
          }

          <div className="section-title" style={{ color: '#0369a1', borderColor: '#0ea5e9', background: '#f0f9ff', marginTop: 16 }}>
            Colaboradores — {colabAniv.length} aniversariante{colabAniv.length !== 1 ? 's' : ''}
          </div>
          {colabAniv.length === 0
            ? <div className="empty">Nenhum colaborador faz aniversário em {MESES[mes]}.</div>
            : <div className="cards">
                {colabAniv.map((c: any) => (
                  <div key={c.id} className="card card-colab">
                    <div className="card-day">{c.dt_nascimento.slice(8,10)}</div>
                    <div className="card-name">{c.nome}</div>
                    <div className="card-sub">{CARGO_LABEL[c.cargo] ?? c.cargo}</div>
                  </div>
                ))}
              </div>
          }

          <div className="footer">Gerado pelo KTX Academy — Sistema de Gestão Escolar</div>
        </div>
      </body>
    </html>
  )
}
