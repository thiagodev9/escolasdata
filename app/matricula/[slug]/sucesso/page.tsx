import { GraduationCap, CheckCircle2, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/admin'

export default async function MatriculaSucessoPage({ params }: { params: { slug: string } }) {
  const admin = createClient()
  const { data: escola } = await (admin as any)
    .from('escolas')
    .select('nome, telefone')
    .eq('slug', params.slug)
    .single() as { data: { nome: string; telefone: string | null } | null }

  return (
    <div className="min-h-screen bg-[#fff8f2] flex flex-col">
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#004ac6] rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Pré-Matrícula</p>
            <p className="text-base font-bold">{escola?.nome ?? 'EduNest'}</p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#1B3A6B] mb-2">Solicitação Enviada!</h1>
          <p className="text-gray-600 mb-8">
            Recebemos sua solicitação de pré-matrícula. A equipe de <strong>{escola?.nome}</strong> entrará em contato em breve para confirmar a vaga.
          </p>

          <div className="bg-white rounded-xl border border-[#e8e1dc] p-5 mb-6 text-left space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#b54e00] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#1B3A6B]">Próximo passo</p>
                <p className="text-sm text-gray-600">Aguarde o contato da escola em até 2 dias úteis.</p>
              </div>
            </div>
            {escola?.telefone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#004ac6] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-[#1B3A6B]">Dúvidas?</p>
                  <p className="text-sm text-gray-600">Ligue para <strong>{escola.telefone}</strong></p>
                </div>
              </div>
            )}
          </div>

          <Link
            href={`/matricula/${params.slug}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#004ac6] hover:underline"
          >
            Enviar outra solicitação
          </Link>
        </div>
      </div>
    </div>
  )
}
