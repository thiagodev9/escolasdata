export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@/lib/supabase/admin'
import { ChevronLeft, CheckCircle2, Clock, AlertCircle, Ban } from 'lucide-react'
import { getResponsavel } from '@/lib/portal/get-responsavel'

const STATUS_CONFIG = {
  pago:     { label: 'Pago',     Icon: CheckCircle2, cor: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  pendente: { label: 'Pendente', Icon: Clock,        cor: 'text-amber-700 bg-amber-50 border-amber-200' },
  vencido:  { label: 'Vencido',  Icon: AlertCircle,  cor: 'text-red-700 bg-red-50 border-red-200' },
  isento:   { label: 'Isento',   Icon: Ban,          cor: 'text-slate-500 bg-slate-50 border-slate-200' },
}

const MESES_ABREV = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

function formatarData(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR')
}

export default async function PortalMensalidadesPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const admin = createAdminClient()
  const responsavel = await getResponsavel(user.email!)
  if (!responsavel) redirect('/portal/login?erro=nao-cadastrado')

  const { data: links } = await (admin as any)
    .from('alunos_responsaveis')
    .select('alunos(id, nome)')
    .eq('responsavel_id', responsavel.id)

  const alunos: { id: string; nome: string }[] = (links ?? []).map((l: any) => ({
    id: l.alunos.id,
    nome: l.alunos.nome,
  }))

  const alunoIds = alunos.map(a => a.id)

  const { data: mensalidades } = alunoIds.length > 0
    ? await (admin as any)
        .from('mensalidades')
        .select('id, aluno_id, mes_referencia, valor, status, dt_vencimento, dt_pagamento, forma_pagamento')
        .in('aluno_id', alunoIds)
        .order('mes_referencia', { ascending: false })
    : { data: [] }

  const totalAberto = (mensalidades ?? [])
    .filter((m: any) => ['pendente', 'vencido'].includes(m.status))
    .reduce((acc: number, m: any) => acc + Number(m.valor), 0)

  return (
    <div className="max-w-md mx-auto px-4 pt-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/portal" className="text-slate-400 hover:text-slate-600 p-1">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-black text-slate-800">Mensalidades</h1>
      </div>

      {totalAberto > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-bold text-amber-800">Valor em aberto</p>
          <p className="text-3xl font-black text-amber-700 mt-1">
            R$ {totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Entre em contato com a escola para realizar o pagamento.
          </p>
        </div>
      )}

      {alunos.map(aluno => {
        const mens = (mensalidades ?? []).filter((m: any) => m.aluno_id === aluno.id)

        return (
          <div key={aluno.id} className="mb-5">
            <p className="font-black text-slate-700 text-sm mb-2 px-1">{aluno.nome}</p>

            {mens.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-4 text-center text-sm text-slate-400">
                Nenhuma mensalidade registrada
              </div>
            ) : (
              <div className="space-y-2">
                {mens.map((m: any) => {
                  const cfg = STATUS_CONFIG[m.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pendente
                  const { Icon, label, cor } = cfg
                  const [ano, mesNum] = m.mes_referencia.split('-')

                  return (
                    <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800">
                            {MESES_ABREV[Number(mesNum) - 1]}/{ano}
                          </p>
                          {m.status !== 'pago' && m.dt_vencimento && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Vence: {formatarData(m.dt_vencimento)}
                            </p>
                          )}
                          {m.status === 'pago' && m.dt_pagamento && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              Pago em: {formatarData(m.dt_pagamento)}
                              {m.forma_pagamento ? ` · ${m.forma_pagamento}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-slate-800">
                            R$ {Number(m.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border mt-1 ${cor}`}>
                            <Icon className="w-3 h-3" />
                            {label}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
