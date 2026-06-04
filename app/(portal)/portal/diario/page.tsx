export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft, BookOpen, Utensils, Moon, Baby, Palette, MessageSquare, Eye } from 'lucide-react'
import { getResponsavel } from '@/lib/portal/get-responsavel'

const TIPO_CFG: Record<string, { label: string; icon: React.ElementType; cor: string }> = {
  refeicao:  { label: 'Refeição',  icon: Utensils,      cor: 'bg-amber-100 text-amber-700' },
  sono:      { label: 'Sono',      icon: Moon,          cor: 'bg-indigo-100 text-indigo-700' },
  fralda:    { label: 'Fraldas',   icon: Baby,          cor: 'bg-pink-100 text-pink-700' },
  atividade: { label: 'Atividade', icon: Palette,       cor: 'bg-orange-100 text-orange-700' },
  recado:    { label: 'Recado',    icon: MessageSquare, cor: 'bg-blue-100 text-blue-700' },
}

export default async function PortalDiarioPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const admin = createAdminClient()
  const responsavel = await getResponsavel(user.email!)
  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  // Filhos do responsável
  const { data: links } = await (admin as any)
    .from('alunos_responsaveis')
    .select('alunos(id, nome, foto_url)')
    .eq('responsavel_id', responsavel.id)

  const alunos: { id: string; nome: string; foto_url: string | null }[] =
    (links ?? []).map((l: any) => ({ id: l.alunos.id, nome: l.alunos.nome, foto_url: l.alunos.foto_url ?? null }))

  const alunoIds = alunos.map(a => a.id)

  if (alunoIds.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-black text-slate-800">Diário</h1>
        </div>
        <p className="text-slate-400 text-sm text-center mt-16">Nenhum aluno vinculado.</p>
      </div>
    )
  }

  // Registros dos últimos 7 dias
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 7)

  const { data: registros } = await (admin as any)
    .from('registros_diarios')
    .select('id, aluno_id, tipo, titulo, descricao, hora, data')
    .in('aluno_id', alunoIds)
    .gte('data', dataLimite.toISOString().split('T')[0])
    .order('data', { ascending: false })
    .order('hora', { ascending: false })

  // Verificar o que já foi visto
  const registroIds = (registros ?? []).map((r: any) => r.id)
  const { data: vistos } = registroIds.length > 0
    ? await (admin as any)
        .from('diario_visualizacoes')
        .select('registro_id')
        .eq('responsavel_id', responsavel.id)
        .in('registro_id', registroIds)
    : { data: [] }

  const vistosSet = new Set((vistos ?? []).map((v: any) => v.registro_id))

  // Marcar todos como vistos (registrar novos não vistos)
  const novosNaoVistos = registroIds.filter((id: string) => !vistosSet.has(id))
  if (novosNaoVistos.length > 0) {
    await (admin as any)
      .from('diario_visualizacoes')
      .upsert(
        novosNaoVistos.map((rid: string) => ({ registro_id: rid, responsavel_id: responsavel.id })),
        { onConflict: 'registro_id,responsavel_id' }
      )
  }

  // Agrupar por data
  const porData: Record<string, any[]> = {}
  for (const r of registros ?? []) {
    if (!porData[r.data]) porData[r.data] = []
    porData[r.data].push(r)
  }

  const alunoMap = Object.fromEntries(alunos.map(a => [a.id, a]))

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Diário</h1>
      </div>

      {Object.keys(porData).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BookOpen className="w-12 h-12 mb-3 opacity-40" />
          <p className="font-semibold">Nenhum registro nos últimos 7 dias.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(porData).map(([data, regs]) => (
            <div key={data}>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                {new Date(data + 'T12:00').toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })}
              </p>
              <div className="space-y-2.5">
                {regs.map((r: any) => {
                  const cfg  = TIPO_CFG[r.tipo] ?? TIPO_CFG.recado
                  const Icon = cfg.icon
                  const aluno = alunoMap[r.aluno_id]
                  const jaVisto = vistosSet.has(r.id)
                  return (
                    <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.cor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-black text-slate-800 text-sm">{r.titulo}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cor}`}>{cfg.label}</span>
                          </div>
                          {r.descricao && (
                            <p className="text-sm text-slate-600">{r.descricao}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5">
                            {aluno && (
                              <div className="flex items-center gap-1">
                                {aluno.foto_url
                                  ? <img src={aluno.foto_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                                  : <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                                      <span className="text-[8px] font-black text-primary">{aluno.nome[0]}</span>
                                    </div>
                                }
                                <span className="text-xs text-slate-500">{aluno.nome.split(' ')[0]}</span>
                              </div>
                            )}
                            {r.hora && <span className="text-xs text-slate-400">{r.hora}</span>}
                            {jaVisto && (
                              <div className="flex items-center gap-0.5 text-emerald-500">
                                <Eye className="w-3 h-3" />
                                <span className="text-[10px] font-semibold">Visto</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
