import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { DiarioCard } from '@/components/responsavel/diario-card'
import { RefeicaoCard } from '@/components/responsavel/refeicao-card'
import { SonoCard } from '@/components/responsavel/sono-card'
import { FraldasCard } from '@/components/responsavel/fraldas-card'
import { RecadoCard } from '@/components/responsavel/recado-card'

export default async function DiarioPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('nome, escola_id').eq('id', user?.id).single() as { data: any }

  // Busca o primeiro filho do responsável (simplificado)
  const { data: alunos } = await (admin as any)
    .from('alunos')
    .select('id, nome, foto_url, alunos_turmas(turma:turmas(nome))')
    .eq('escola_id', usuario?.escola_id)
    .limit(1) as { data: any[] | null }

  const aluno = alunos?.[0]
  const turma = aluno?.alunos_turmas?.[0]?.turma?.nome ?? 'Turma'

  const hoje = new Date()
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' })
    .replace(/^\w/, c => c.toUpperCase())

  const { data: registros } = await (admin as any)
    .from('registros_diarios')
    .select('*')
    .eq('aluno_id', aluno?.id)
    .eq('data', hoje.toISOString().split('T')[0])
    .order('hora') as { data: any[] | null }

  const refeicoes  = registros?.filter(r => r.tipo === 'refeicao') ?? []
  const sonos      = registros?.filter(r => r.tipo === 'sono')     ?? []
  const fraldas    = registros?.filter(r => r.tipo === 'fralda')   ?? []
  const atividades = registros?.filter(r => r.tipo === 'atividade')?.slice(0, 1) ?? []
  const recados    = registros?.filter(r => r.tipo === 'recado')   ?? []

  if (!aluno) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p className="text-2xl font-bold text-foreground">Nenhum aluno vinculado</p>
        <p className="text-muted-foreground mt-2">Entre em contato com a escola para vincular seu filho.</p>
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-soft px-5 pt-12 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {aluno.foto_url
                ? <img src={aluno.foto_url} className="w-full h-full object-cover" alt={aluno.nome} />
                : <span className="text-base font-bold text-primary">
                    {aluno.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                  </span>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Diário da</p>
              <p className="text-lg font-bold text-foreground leading-tight">{aluno.nome.split(' ')[0]}</p>
            </div>
          </div>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-foreground">{dataFormatada} · {diaSemana}</p>
            <p className="text-sm text-muted-foreground">{turma}</p>
          </div>
        </div>

        {/* Chips rápidos */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-primary text-white rounded-full py-2 text-xs font-semibold">
            Tudo em ordem 👍
          </button>
          <button className="flex-1 border border-border rounded-full py-2 text-xs font-semibold text-foreground">
            Relatório do Dia
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="px-4 py-5 space-y-4">

        {/* Refeições */}
        {refeicoes.length > 0 && (
          <RefeicaoCard refeicoes={refeicoes} />
        )}

        {/* Sono */}
        {sonos.length > 0 && (
          <SonoCard sonos={sonos} />
        )}

        {/* Atividade com foto */}
        {atividades.length > 0 && (
          <DiarioCard registro={atividades[0]} />
        )}

        {/* Fraldas */}
        {fraldas.length > 0 && (
          <FraldasCard fraldas={fraldas} />
        )}

        {/* Recados */}
        {recados.map(r => <RecadoCard key={r.id} recado={r} />)}

        {/* Empty state */}
        {registros?.length === 0 && (
          <div className="bg-white rounded-xl shadow-soft p-8 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-bold text-foreground">Sem registros hoje ainda</p>
            <p className="text-sm text-muted-foreground mt-1">
              A professora ainda não publicou registros de hoje.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
