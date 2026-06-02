import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrintTrigger } from '@/components/relatorios/print-trigger'
import type { Aluno } from '@/lib/supabase/types'

export default async function RelatorioAlunosPage({
  searchParams,
}: {
  searchParams: { turma?: string }
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

  let query = (admin as any)
    .from('alunos')
    .select('*, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId)
    .eq('status', 'ativo')
    .order('nome')

  const { data: alunos } = await query as { data: (Aluno & { alunos_turmas: { turma: { nome: string } | null }[] })[] | null }

  const lista = alunos ?? []
  const porTurma: Record<string, typeof lista> = {}
  for (const aluno of lista) {
    const turma = aluno.alunos_turmas?.[0]?.turma?.nome ?? 'Sem turma'
    if (searchParams.turma && turma !== searchParams.turma) continue
    if (!porTurma[turma]) porTurma[turma] = []
    porTurma[turma].push(aluno)
  }

  const hoje = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

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
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1B3A6B' }}>Lista de Alunos</h1>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {searchParams.turma ? `Turma: ${searchParams.turma}` : 'Todas as turmas'} · Gerado em {hoje}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '11px', color: '#666' }}>Total</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: '#004ac6' }}>{lista.length}</p>
            <p style={{ fontSize: '11px', color: '#666' }}>alunos ativos</p>
          </div>
        </div>

        {/* Tabelas por turma */}
        {Object.entries(porTurma).map(([turma, alunos]) => (
          <div key={turma} style={{ marginBottom: '32px', pageBreakInside: 'avoid' }}>
            <div style={{ background: '#1B3A6B', color: '#fff', padding: '8px 12px', borderRadius: '4px 4px 0 0', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '13px' }}>{turma}</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>{alunos.length} alunos</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f0f4ff' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>#</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Nome</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Nascimento</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Idade</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Ass. Responsável</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((a, i) => (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', color: '#999' }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', fontWeight: 600 }}>{a.nome}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', color: '#555' }}>
                      {new Date(a.dt_nascimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', color: '#555' }}>
                      {calcIdade(a.dt_nascimento)}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8' }}>
                      <div style={{ borderBottom: '1px solid #aaa', width: '120px', height: '20px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div style={{ marginTop: '40px', borderTop: '1px solid #e8e1dc', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
          <span>{usuario?.escola?.nome}</span>
          <span>EduCare — Sistema de Gestão Escolar</span>
          <span>{hoje}</span>
        </div>
      </div>
    </>
  )
}

function calcIdade(nasc: string) {
  const hoje = new Date()
  const n    = new Date(nasc)
  let anos   = hoje.getFullYear() - n.getFullYear()
  let meses  = hoje.getMonth() - n.getMonth()
  if (meses < 0) { anos--; meses += 12 }
  if (anos === 0) return `${meses}m`
  if (meses === 0) return `${anos}a`
  return `${anos}a ${meses}m`
}
