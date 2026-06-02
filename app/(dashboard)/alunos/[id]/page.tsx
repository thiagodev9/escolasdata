import { createClient as createAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, BookOpen, User, Phone, Mail, Plus } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { ActivityCard } from '@/components/dashboard/activity-card'

function calcIdade(dt: string) {
  const hoje = new Date(), nasc = new Date(dt)
  let a = hoje.getFullYear() - nasc.getFullYear()
  if (hoje.getMonth() - nasc.getMonth() < 0 ||
     (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) a--
  return `${a} anos`
}

export default async function AlunoPage({ params }: { params: { id: string } }) {
  const admin = createAdmin()

  const { data: aluno } = await (admin as any)
    .from('alunos')
    .select('*, alunos_turmas(turma:turmas(id, nome)), alunos_responsaveis(responsavel:responsaveis(*))')
    .eq('id', params.id)
    .single() as { data: any | null }

  if (!aluno) notFound()

  const { data: registros } = await (admin as any)
    .from('registros_diarios')
    .select('*, criado_por_usuario:usuarios(nome)')
    .eq('aluno_id', params.id)
    .order('data', { ascending: false })
    .order('criado_em', { ascending: false })
    .limit(20) as { data: any[] | null }

  const turma       = aluno.alunos_turmas?.[0]?.turma
  const responsaveis = aluno.alunos_responsaveis?.map((ar: any) => ar.responsavel) ?? []

  const statusMap: Record<string, 'ativo' | 'pendente' | 'inativo'> = {
    ativo: 'ativo', pendente: 'pendente', inativo: 'inativo',
  }
  const tipoMap: Record<string, 'refeicao' | 'sono' | 'fralda' | 'atividade' | 'pedagogico'> = {
    refeicao: 'refeicao', sono: 'sono', fralda: 'fralda', atividade: 'atividade', recado: 'pedagogico',
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Back */}
      <Link href="/alunos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar para Alunos
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Card principal */}
        <div className="lg:col-span-1 space-y-4">
          {/* Perfil */}
          <div className="bg-white rounded-lg shadow-soft p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {aluno.foto_url
                ? <img src={aluno.foto_url} alt={aluno.nome} className="w-full h-full rounded-full object-cover" />
                : <span className="text-2xl font-bold text-primary">
                    {aluno.nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                  </span>
              }
            </div>
            <h1 className="text-xl font-bold text-foreground">{aluno.nome}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{calcIdade(aluno.dt_nascimento)}</p>
            <Badge variant={statusMap[aluno.status] ?? 'default'} className="mt-3">
              {aluno.status.charAt(0).toUpperCase() + aluno.status.slice(1)}
            </Badge>
          </div>

          {/* Informações */}
          <div className="bg-white rounded-lg shadow-soft p-5 space-y-4">
            <h3 className="font-bold text-sm text-foreground">Informações</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Nascimento</p>
                  <p className="font-medium">{new Date(aluno.dt_nascimento + 'T12:00').toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Turma</p>
                  <p className="font-medium text-primary">{turma?.nome ?? '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div className="bg-white rounded-lg shadow-soft p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-foreground">Responsáveis</h3>
              <button className="text-xs text-primary font-semibold hover:underline">+ Adicionar</button>
            </div>
            {responsaveis.length === 0
              ? <p className="text-xs text-muted-foreground">Nenhum responsável vinculado.</p>
              : responsaveis.map((r: any) => (
                <div key={r.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{r.nome}</p>
                    {r.telefone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{r.telefone}</p>}
                    {r.email   && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{r.email}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Diário */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Diário do Aluno</h2>
            <button className="flex items-center gap-2 bg-primary text-white rounded-md px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors min-h-[40px]">
              <Plus className="w-4 h-4" /> Novo Registro
            </button>
          </div>

          {(registros ?? []).length === 0 ? (
            <div className="bg-white rounded-lg shadow-soft p-12 flex flex-col items-center text-center">
              <p className="text-lg font-bold text-muted-foreground">Nenhum registro ainda</p>
              <p className="text-sm text-muted-foreground mt-1">Adicione o primeiro registro do diário.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(registros ?? []).map((reg: any) => (
                <ActivityCard
                  key={reg.id}
                  tipo={tipoMap[reg.tipo] ?? 'atividade'}
                  titulo={reg.titulo}
                  descricao={reg.descricao}
                  hora={reg.hora ? reg.hora.slice(0, 5) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
