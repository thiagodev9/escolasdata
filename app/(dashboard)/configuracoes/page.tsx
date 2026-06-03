import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesClient, type ConfigEscola } from '@/components/configuracoes/configuracoes-client'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const supabase = createClient()
  const { data: { user } } = await (supabase as any).auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdmin() as any
  const { data: usuario } = await admin.from('usuarios').select('escola_id, role').eq('id', user.id).single()
  if (!usuario || !['diretora','super_admin'].includes(usuario.role)) redirect('/dashboard')

  const escolaId = usuario.escola_id

  const [escolaRes, configRes] = await Promise.all([
    admin.from('escolas').select('nome').eq('id', escolaId).single(),
    admin.from('configuracoes_escola').select('*').eq('escola_id', escolaId).maybeSingle(),
  ])

  const config: ConfigEscola = configRes.data ?? {
    escola_id:         escolaId,
    nome_fantasia:     null,
    razao_social:      null,
    cnpj:              null,
    logo_url:          null,
    cor_primaria:      '#2563EB',
    telefone:          null,
    whatsapp:          null,
    email_contato:     null,
    site:              null,
    cep:               null,
    rua:               null,
    numero:            null,
    complemento:       null,
    bairro:            null,
    cidade:            null,
    estado:            null,
    horario_entrada:   '07:00',
    horario_saida:     '17:00',
    valor_mensalidade: 0,
    dia_vencimento:    10,
    diretor_nome:      null,
    diretor_cpf:       null,
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Logo, dados da escola, horários e mensalidades.</p>
      </div>
      <ConfiguracoesClient config={config} escolaNome={escolaRes.data?.nome ?? ''} />
    </div>
  )
}
