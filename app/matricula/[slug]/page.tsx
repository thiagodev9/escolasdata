import { createClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { MatriculaForm } from '@/components/matricula/matricula-form'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const admin = createClient()
  const { data } = await (admin as any)
    .from('escolas')
    .select('nome')
    .eq('slug', params.slug)
    .single() as { data: { nome: string } | null }
  return { title: data ? `Pré-Matrícula — ${data.nome}` : 'Pré-Matrícula' }
}

export default async function MatriculaPage({ params }: { params: { slug: string } }) {
  const admin = createClient()

  const { data: escola } = await (admin as any)
    .from('escolas')
    .select('id, nome, slug')
    .eq('slug', params.slug)
    .eq('ativo', true)
    .single() as { data: { id: string; nome: string; slug: string } | null }

  if (!escola) notFound()

  const { data: turmasData } = await (admin as any)
    .from('turmas')
    .select('id, nome')
    .eq('escola_id', escola.id)
    .order('nome') as { data: { id: string; nome: string }[] | null }

  return (
    <MatriculaForm
      escolaId={escola.id}
      escolaNome={escola.nome}
      turmas={turmasData ?? []}
      slug={escola.slug}
    />
  )
}
