import { createClient as createAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NfseClient } from '@/components/nfse/nfse-client'
import type { NfseConfig, NfseEmitida } from '@/lib/supabase/types'

export default async function NfsePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createAdmin()
  const { data: usuario } = await (admin as any)
    .from('usuarios')
    .select('escola_id')
    .eq('id', user?.id)
    .single() as { data: { escola_id: string } | null }

  const escolaId = usuario?.escola_id ?? ''

  const [configRes, emitidasRes, alunosRes] = await Promise.all([
    (admin as any).from('nfse_config').select('*').eq('escola_id', escolaId).maybeSingle(),
    (admin as any).from('nfse_emitidas').select('*').eq('escola_id', escolaId).order('criado_em', { ascending: false }).limit(100),
    (admin as any).from('alunos')
      .select('id, nome, alunos_responsaveis(responsavel:responsaveis(id, nome, email))')
      .eq('escola_id', escolaId)
      .eq('status', 'ativo')
      .order('nome'),
  ])

  const alunos = (alunosRes.data ?? []).map((a: any) => ({
    id:  a.id,
    nome: a.nome,
    responsaveis: (a.alunos_responsaveis ?? []).map((ar: any) => ar.responsavel).filter(Boolean),
  }))

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">NFS-e</h1>
        <p className="text-muted-foreground mt-1">
          Nota Fiscal de Serviço Eletrônica — emissão automática via NFe.io ou XML para prefeitura.
        </p>
      </div>
      <NfseClient
        emitidas={emitidasRes.data ?? []}
        alunos={alunos}
        config={configRes.data as NfseConfig | null}
        escolaId={escolaId}
        autorId={user?.id ?? ''}
      />
    </div>
  )
}
