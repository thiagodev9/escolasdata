import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { isConfigured } from '@/lib/asaas/client'
import { FinanceiroClient } from '@/components/financeiro/financeiro-client'
import { AlertCircle } from 'lucide-react'

const MOCK_COBRANCAS = [
  { id:'1', customerName:'Maria Silva (Enzo)',      billingType:'PIX',         value:1200, dueDate:'2024-06-10', status:'PENDING',   description:'Mensalidade Junho/2024' },
  { id:'2', customerName:'Roberto Oliveira (Ana)',  billingType:'BOLETO',      value:1200, dueDate:'2024-06-10', status:'OVERDUE',   description:'Mensalidade Junho/2024' },
  { id:'3', customerName:'Juliana Santos (Pedro)',  billingType:'CREDIT_CARD', value:1200, dueDate:'2024-06-05', status:'RECEIVED',  description:'Mensalidade Junho/2024' },
  { id:'4', customerName:'Carlos Souza (Letícia)',  billingType:'PIX',         value:1200, dueDate:'2024-06-05', status:'RECEIVED',  description:'Mensalidade Junho/2024' },
  { id:'5', customerName:'Ana Costa (Lucas)',       billingType:'BOLETO',      value:1200, dueDate:'2024-06-10', status:'PENDING',   description:'Mensalidade Junho/2024' },
  { id:'6', customerName:'Paulo Lima (Mariana)',    billingType:'PIX',         value:1200, dueDate:'2024-05-10', status:'OVERDUE',   description:'Mensalidade Maio/2024'  },
  { id:'7', customerName:'Sandra Alves (Sofia)',    billingType:'CREDIT_CARD', value:1200, dueDate:'2024-06-05', status:'CONFIRMED', description:'Mensalidade Junho/2024' },
  { id:'8', customerName:'José Pereira (Gabriel)',  billingType:'BOLETO',      value:1200, dueDate:'2024-05-10', status:'CANCELLED', description:'Mensalidade Maio/2024'  },
]

export default async function FinanceiroPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = createAdmin()

  const { data: usuario } = await (admin as any)
    .from('usuarios').select('escola_id').eq('id', user?.id).single() as { data: { escola_id: string } | null }
  const escolaId = usuario?.escola_id ?? ''

  // Buscar alunos e responsáveis para o modal de nova cobrança
  const { data: alunos } = await (admin as any)
    .from('alunos')
    .select('id, nome, alunos_responsaveis(responsavel:responsaveis(nome, email, telefone))')
    .eq('escola_id', escolaId)
    .eq('status', 'ativo')
    .order('nome') as { data: any[] | null }

  const asaasAtivo = isConfigured()
  const total    = MOCK_COBRANCAS.reduce((s,c) => s+c.value, 0)
  const recebido = MOCK_COBRANCAS.filter(c => ['RECEIVED','CONFIRMED'].includes(c.status)).reduce((s,c) => s+c.value, 0)
  const pendente = MOCK_COBRANCAS.filter(c => c.status==='PENDING').reduce((s,c) => s+c.value, 0)
  const vencido  = MOCK_COBRANCAS.filter(c => c.status==='OVERDUE').reduce((s,c) => s+c.value, 0)
  const fmt = (v:number) => v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Cobranças via PIX, boleto e cartão — Asaas.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Total Emitido', value:fmt(total),    color:'text-foreground'  },
          { label:'Recebido',      value:fmt(recebido), color:'text-green-600'   },
          { label:'Pendente',      value:fmt(pendente), color:'text-amber-600'   },
          { label:'Vencido',       value:fmt(vencido),  color:'text-red-600'     },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-lg shadow-soft p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {!asaasAtivo && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-amber-700">
            <strong>Modo demo</strong> — Configure <code className="bg-amber-100 px-1 rounded">ASAAS_API_KEY</code> no <code className="bg-amber-100 px-1 rounded">.env.local</code> para cobranças reais.
            Obtenha sua chave em <a href="https://asaas.com" target="_blank" className="underline">asaas.com</a>.
          </p>
        </div>
      )}

      <FinanceiroClient cobrancas={MOCK_COBRANCAS as any} alunos={alunos ?? []} asaasAtivo={asaasAtivo} />
    </div>
  )
}
