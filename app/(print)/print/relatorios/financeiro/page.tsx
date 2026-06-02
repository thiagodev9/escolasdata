import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrintTrigger } from '@/components/relatorios/print-trigger'

export default async function RelatorioFinanceiroPage({
  searchParams,
}: {
  searchParams: { mes?: string; ano?: string }
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
  const nomeMes  = new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const hojeStr  = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  // Alunos com status de pagamento
  const { data: alunos } = await (admin as any)
    .from('alunos')
    .select('id, nome, status, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', escolaId)
    .order('nome') as {
      data: {
        id: string; nome: string; status: string
        alunos_turmas: { turma: { nome: string } | null }[]
      }[] | null
    }

  const lista     = alunos ?? []
  const ativos    = lista.filter(a => a.status === 'ativo')
  const inativos  = lista.filter(a => a.status === 'inativo')
  const pendentes = lista.filter(a => a.status === 'pendente')

  return (
    <>
      <PrintTrigger />
      <div style={{ padding: '0 0 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #004ac6', paddingBottom: '16px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#004ac6', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
              {usuario?.escola?.nome ?? 'EduCare'}
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#1B3A6B' }}>Relatório Financeiro</h1>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px', textTransform: 'capitalize' }}>
              {nomeMes} · Gerado em {hojeStr}
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <KpiBox label="Alunos Ativos"   value={String(ativos.length)}   cor="#16a34a" />
          <KpiBox label="Inadimplentes"   value={String(pendentes.length)} cor="#d97706" />
          <KpiBox label="Inativos"        value={String(inativos.length)}  cor="#9ca3af" />
        </div>

        {/* Tabela de inadimplentes */}
        {pendentes.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#b54e00', marginBottom: '12px' }}>
              Alunos com Pendência
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#fff7ed' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#92400e', borderBottom: '1px solid #fed7aa' }}>Aluno</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#92400e', borderBottom: '1px solid #fed7aa' }}>Turma</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#92400e', borderBottom: '1px solid #fed7aa' }}>Ass. Responsável</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map((a, i) => (
                  <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fffbf5' }}>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', fontWeight: 600 }}>{a.nome}</td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', color: '#555' }}>
                      {a.alunos_turmas?.[0]?.turma?.nome ?? '-'}
                    </td>
                    <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8' }}>
                      <div style={{ borderBottom: '1px solid #aaa', width: '140px', height: '20px' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Todos os alunos */}
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1B3A6B', marginBottom: '12px' }}>
          Todos os Alunos
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f0f4ff' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Aluno</th>
              <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Turma</th>
              <th style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#1B3A6B', borderBottom: '1px solid #e8e1dc' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((a, i) => {
              const cor = a.status === 'ativo' ? '#16a34a' : a.status === 'pendente' ? '#d97706' : '#9ca3af'
              const lbl = a.status === 'ativo' ? 'Ativo' : a.status === 'pendente' ? 'Inadimplente' : 'Inativo'
              return (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', fontWeight: 600 }}>{a.nome}</td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', color: '#555' }}>
                    {a.alunos_turmas?.[0]?.turma?.nome ?? '-'}
                  </td>
                  <td style={{ padding: '8px 10px', borderBottom: '1px solid #f0ece8', textAlign: 'center' }}>
                    <span style={{ color: cor, fontWeight: 700, fontSize: '11px' }}>{lbl}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', borderTop: '1px solid #e8e1dc', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
          <span>{usuario?.escola?.nome}</span>
          <span>EduCare — Sistema de Gestão Escolar</span>
          <span>{hojeStr}</span>
        </div>
      </div>
    </>
  )
}

function KpiBox({ label, value, cor }: { label: string; value: string; cor: string }) {
  return (
    <div style={{ border: '1px solid #e8e1dc', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
      <p style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>{label}</p>
      <p style={{ fontSize: '32px', fontWeight: 800, color: cor }}>{value}</p>
    </div>
  )
}
