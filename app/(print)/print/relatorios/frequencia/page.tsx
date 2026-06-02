import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrintTrigger } from '@/components/relatorios/print-trigger'

export default async function RelatorioFrequenciaPage({
  searchParams,
}: {
  searchParams: { mes?: string; ano?: string; turma?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id, escola:escolas(nome)')
    .eq('id', user.id)
    .single() as { data: { escola_id: string; escola: { nome: string } | null } | null }

  const escolaId = usuario?.escola_id ?? ''

  const hoje     = new Date()
  const ano      = parseInt(searchParams.ano  ?? String(hoje.getFullYear()))
  const mes      = parseInt(searchParams.mes  ?? String(hoje.getMonth() + 1))
  const inicio   = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fim      = `${ano}-${String(mes).padStart(2, '0')}-31`

  // Alunos ativos
  const { data: alunos } = await (admin as any)
    .from('alunos')
    .select('id, nome, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId)
    .eq('status', 'ativo')
    .order('nome') as { data: { id: string; nome: string; alunos_turmas: { turma: { nome: string } | null }[] }[] | null }

  // Presenças do mês
  const { data: presencas } = await (admin as any)
    .from('presencas')
    .select('aluno_id, data, presente')
    .eq('escola_id', escolaId)
    .gte('data', inicio)
    .lte('data', fim) as { data: { aluno_id: string; data: string; presente: boolean }[] | null }

  const lista     = alunos ?? []
  const presMap   = new Map<string, number>()
  const totalMap  = new Map<string, number>()

  for (const p of presencas ?? []) {
    const cur  = presMap.get(p.aluno_id) ?? 0
    const tot  = totalMap.get(p.aluno_id) ?? 0
    if (p.presente) presMap.set(p.aluno_id, cur + 1)
    totalMap.set(p.aluno_id, tot + 1)
  }

  const porTurma: Record<string, typeof lista> = {}
  for (const aluno of lista) {
    const turma = aluno.alunos_turmas?.[0]?.turma?.nome ?? 'Sem turma'
    if (searchParams.turma && turma !== searchParams.turma) continue
    if (!porTurma[turma]) porTurma[turma] = []
    porTurma[turma].push(aluno)
  }

  const nomeMes = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const hojeStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <>
      <PrintTrigger />
      <div style={{ padding: '0 0 24px 0' }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #004ac6', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#004ac6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
              {usuario?.escola?.nome ?? 'EduCare'}
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1B3A6B' }}>Relatório de Frequência</h1>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textTransform: 'capitalize' }}>
              {nomeMes} · Gerado em {hojeStr}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#666' }}>Total Alunos</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#004ac6' }}>{lista.length}</p>
          </div>
        </div>

        {Object.entries(porTurma).map(([turma, alunos]) => {
          const total = alunos.length
          const mediaFreq = total === 0 ? 0 :
            alunos.reduce((acc, a) => {
              const pres  = presMap.get(a.id) ?? 0
              const dias  = totalMap.get(a.id) ?? 0
              return acc + (dias > 0 ? pres / dias : 0)
            }, 0) / total * 100

          return (
            <div key={turma} style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
              <div style={{ background: '#1B3A6B', color: '#fff', padding: '8px 12px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{turma}</span>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>
                  {total} alunos · Média {mediaFreq.toFixed(1)}%
                </span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ background: '#f0f4ff' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Aluno</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Presenças</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Faltas</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Freq.</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Ass. Responsável</th>
                  </tr>
                </thead>
                <tbody>
                  {alunos.map((a, i) => {
                    const pres  = presMap.get(a.id) ?? 0
                    const dias  = totalMap.get(a.id) ?? 0
                    const falt  = dias - pres
                    const freq  = dias > 0 ? (pres / dias * 100).toFixed(1) : '-'
                    const freqN = dias > 0 ? pres / dias * 100 : 100
                    const cor   = freqN >= 75 ? '#16a34a' : freqN >= 50 ? '#d97706' : '#dc2626'

                    return (
                      <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', fontWeight: 600 }}>{a.nome}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', textAlign: 'center' }}>{pres}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', textAlign: 'center', color: falt > 0 ? '#dc2626' : '#555' }}>{falt}</td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', textAlign: 'center', fontWeight: 700, color: cor }}>
                          {freq}{freq !== '-' ? '%' : ''}
                        </td>
                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8' }}>
                          <div style={{ borderBottom: '1px solid #aaa', width: '120px', height: '20px' }} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        })}

        <div style={{ marginTop: '40px', borderTop: '1px solid #e8e1dc', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
          <span>{usuario?.escola?.nome}</span>
          <span>EduCare — Sistema de Gestão Escolar</span>
          <span>{hojeStr}</span>
        </div>
      </div>
    </>
  )
}
