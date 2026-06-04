import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
  Users, BookOpen, AlertTriangle, Star,
  MessageSquare, DollarSign, ChevronRight,
  Clock, CalendarDays, TrendingUp, Sparkles,
} from 'lucide-react'
import { StatCard } from '@/components/dashboard/stat-card'
import Link from 'next/link'

async function getDashboardData(escolaId: string) {
  const admin = createAdmin()
  const hoje = new Date()
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0')
  const diaHoje = String(hoje.getDate()).padStart(2, '0')

  const [alunosRes, turmasRes, pendentesRes, feedRes, todosAlunosRes, colaboradoresRes] = await Promise.all([
    (admin as any).from('alunos').select('id', { count: 'exact' }).eq('escola_id', escolaId).eq('status', 'ativo'),
    (admin as any).from('turmas').select('id, nome, capacidade', { count: 'exact' }).eq('escola_id', escolaId),
    (admin as any).from('alunos').select('id', { count: 'exact' }).eq('escola_id', escolaId).eq('status', 'pendente'),
    (admin as any).from('feed_posts').select('id', { count: 'exact' }).eq('escola_id', escolaId),
    (admin as any).from('alunos').select('id, nome, foto_url, dt_nascimento').eq('escola_id', escolaId).eq('status', 'ativo'),
    (admin as any).from('colaboradores').select('id, nome, dt_admissao').eq('escola_id', escolaId).eq('ativo', true),
  ])

  const anivAlunos: { id: string; nome: string; foto_url: string | null }[] =
    (todosAlunosRes.data ?? [])
      .filter((a: { dt_nascimento: string }) => {
        const [, m, d] = (a.dt_nascimento ?? '').split('-')
        return m === mesHoje && d === diaHoje
      })
      .map((a: { id: string; nome: string; foto_url: string | null }) => ({
        id: a.id, nome: a.nome, foto_url: a.foto_url ?? null,
      }))

  const aniversariantes = anivAlunos

  return {
    totalAlunos: alunosRes.count ?? 0,
    totalTurmas: turmasRes.count ?? 0,
    turmas: turmasRes.data ?? [],
    pendentes: pendentesRes.count ?? 0,
    totalPosts: feedRes.count ?? 0,
    aniversariantes,
  }
}

const DIAS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']
const FREQ  = [88, 91, 95, 98, 82, 40, 10]

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('nome, escola_id, escola:escolas(nome)')
    .eq('id', user?.id)
    .single() as { data: { nome: string; escola_id: string; escola: { nome: string } | null } | null }

  const escolaId = usuario?.escola_id ?? ''
  const stats = await getDashboardData(escolaId)

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  const primeiroNome = usuario?.nome?.split(' ')[0] ?? 'Diretora'

  const hora = new Date().getHours()
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'

  const inadimplencia = stats.totalAlunos > 0
    ? ((stats.pendentes / stats.totalAlunos) * 100).toFixed(1)
    : '0.0'

  const maxFreq = Math.max(...FREQ)

  return (
    <div className="p-6 lg:p-8 animate-fade-in">

      {/* Header — estilo BrightFuture */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            {saudacao}, {primeiroNome}! 👋
          </h1>
          <p className="text-slate-500 mt-1 capitalize text-sm">
            Aqui está o resumo de <span className="font-semibold text-primary">{usuario?.escola?.nome ?? 'sua escola'}</span> para hoje, {hoje}.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5 shadow-soft border border-slate-100">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-slate-700">{stats.totalAlunos} alunos</span>
          <span className="text-xs text-emerald-500 font-semibold">ativos</span>
        </div>
      </div>

      {/* Aniversariantes do dia */}
      {stats.aniversariantes.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-pink-50 to-amber-50 border border-pink-100 rounded-2xl p-4 flex items-center gap-4 flex-wrap">
          <span className="text-2xl">🎂</span>
          <div className="flex-1">
            <p className="text-sm font-black text-pink-700">
              Aniversário hoje!{stats.aniversariantes.length > 1 ? ` (${stats.aniversariantes.length} alunos)` : ''}
            </p>
            <p className="text-sm text-pink-600 font-semibold">
              {stats.aniversariantes.map(a => a.nome.split(' ')[0]).join(', ')}
            </p>
          </div>
          <div className="flex -space-x-2">
            {stats.aniversariantes.slice(0, 5).map(a => (
              <div key={a.id} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-pink-200 flex items-center justify-center shrink-0">
                {a.foto_url
                  ? <img src={a.foto_url} alt={a.nome} className="w-full h-full object-cover" />
                  : <span className="text-xs font-black text-pink-700">{a.nome[0]}</span>
                }
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs — ícones coloridos */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
          variacao="+2 este mês"
          iconColor="kpi-icon-blue"
        />
        <StatCard
          label="Turmas Ativas"
          value={stats.totalTurmas}
          icon={BookOpen}
          variacaoLabel="Capacidade: 92%"
          iconColor="kpi-icon-green"
        />
        <StatCard
          label="Inadimplência"
          value={`${inadimplencia}%`}
          icon={AlertTriangle}
          status={parseFloat(inadimplencia) > 5 ? 'atencao' : 'normal'}
          iconColor="kpi-icon-orange"
        />
        <StatCard
          label="Posts no Feed"
          value={stats.totalPosts}
          icon={Star}
          iconColor="kpi-icon-purple"
        />
      </div>

      {/* Grid principal */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Atalhos Rápidos */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100/80 p-6">
          <h2 className="text-base font-black text-slate-800 mb-4">Atalhos Rápidos</h2>
          <div className="space-y-2.5">
            <Link
              href="/alunos"
              className="flex items-center gap-3 bg-primary text-white rounded-xl px-4 py-3 hover:bg-primary/90 transition-all font-bold text-sm shadow-soft active:scale-[0.99] group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              Novo Aluno
              <ChevronRight className="w-4 h-4 ml-auto opacity-60 group-hover:opacity-100" />
            </Link>
            <Link
              href="/feed"
              className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition-all font-bold text-sm text-slate-700 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </div>
              Mensagem em Massa
              <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-500" />
            </Link>
            <Link
              href="/mensalidades"
              className="flex items-center gap-3 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-50 transition-all font-bold text-sm text-slate-700 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              Mensalidades
              <ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-500" />
            </Link>
          </div>

          {/* Banner dica */}
          <div className="mt-5 rounded-2xl overflow-hidden bg-gradient-to-br from-primary to-blue-400 p-4 text-white relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <p className="text-[10px] font-black uppercase tracking-widest opacity-75 mb-1">Dica do dia</p>
            <p className="text-sm font-semibold leading-snug max-w-[85%]">
              Mantenha o cadastro dos responsáveis atualizado para agilizar comunicados via WhatsApp.
            </p>
          </div>
        </div>

        {/* Alertas e Pendências */}
        <div className="bg-white rounded-2xl shadow-soft border border-slate-100/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black text-slate-800">Alertas e Pendências</h2>
            <Link href="/alunos" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {stats.pendentes > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-xl border border-red-100 bg-red-50 cursor-pointer hover:bg-red-100 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {stats.pendentes} aluno{stats.pendentes > 1 ? 's' : ''} sem registro de entrada
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Os responsáveis ainda não confirmaram a chegada via app.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-slate-500" />
              </div>
            )}

            <div className="flex items-start gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800">Reunião de pais amanhã</p>
                <p className="text-xs text-slate-500 mt-0.5">Preparar material para a Turma Maternal I.</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-slate-500" />
            </div>
          </div>

          {/* Frequência Semanal */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-black text-slate-700">Frequência Semanal</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                <TrendingUp className="w-3.5 h-3.5" />
                Média 94%
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-20">
              {DIAS.map((dia, i) => {
                const pct = (FREQ[i] / maxFreq) * 100
                const isHoje = i === 3
                return (
                  <div key={dia} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full rounded-lg transition-all"
                      style={{
                        height: `${pct}%`,
                        minHeight: '6px',
                        background: isHoje
                          ? 'linear-gradient(to top, #2563EB, #60A5FA)'
                          : '#E2E8F0',
                      }}
                    />
                    <span className={`text-[10px] font-bold ${isHoje ? 'text-primary' : 'text-slate-400'}`}>
                      {dia}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
