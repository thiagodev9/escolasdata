import { GraduationCap, Shield } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Política de Privacidade — EduNest',
}

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#fff8f2]">
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#004ac6] rounded-md flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <p className="text-base font-bold">EduNest — Gestão Escolar</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-[#004ac6]" />
          <h1 className="text-3xl font-bold text-[#1B3A6B]">Política de Privacidade</h1>
        </div>

        <div className="bg-white rounded-xl border border-[#e8e1dc] p-8 prose prose-sm max-w-none">
          <p className="text-sm text-gray-500 mb-6">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <Section title="1. Quem somos">
            <p>O <strong>EduNest</strong> é uma plataforma SaaS de gestão para escolas infantis, operada por cada estabelecimento de ensino que utiliza o sistema. Esta política se aplica ao tratamento de dados realizado pelas escolas usuárias do EduNest e pelo próprio sistema.</p>
          </Section>

          <Section title="2. Base legal (LGPD)">
            <p>O tratamento de dados pessoais nesta plataforma é realizado com base nos seguintes fundamentos do Art. 7º da Lei 13.709/2018:</p>
            <ul>
              <li><strong>Consentimento</strong> (Art. 7º, I): para comunicações via WhatsApp e e-mail, publicação de fotos no feed.</li>
              <li><strong>Execução de contrato</strong> (Art. 7º, V): para cobranças de mensalidades, matrícula e gestão pedagógica.</li>
              <li><strong>Interesse legítimo</strong> (Art. 7º, IX): para segurança, auditoria e melhoria do serviço.</li>
            </ul>
          </Section>

          <Section title="3. Dados coletados">
            <p><strong>Sobre crianças (alunos):</strong> nome, data de nascimento, foto, turma, presença, registros pedagógicos (diário).</p>
            <p><strong>Sobre responsáveis:</strong> nome, e-mail, telefone, parentesco.</p>
            <p><strong>Dados de uso:</strong> logs de acesso, IP, tipo de dispositivo — usados exclusivamente para segurança e suporte.</p>
          </Section>

          <Section title="4. Como usamos os dados">
            <ul>
              <li>Gestão de matrícula e presença escolar</li>
              <li>Comunicação entre escola e família</li>
              <li>Cobrança de mensalidades</li>
              <li>Registro de atividades pedagógicas</li>
              <li>Geração de relatórios para a escola</li>
            </ul>
          </Section>

          <Section title="5. Compartilhamento">
            <p>Seus dados podem ser compartilhados com:</p>
            <ul>
              <li><strong>Asaas</strong>: processadora de pagamentos (PIX, boleto, cartão)</li>
              <li><strong>Supabase</strong>: infraestrutura de banco de dados (servidores no Brasil/EUA)</li>
              <li><strong>NFe.io</strong>: emissão de Nota Fiscal de Serviço Eletrônica</li>
            </ul>
            <p>Não vendemos dados pessoais para terceiros.</p>
          </Section>

          <Section title="6. Seus direitos (LGPD, Art. 18)">
            <p>Você pode, a qualquer momento, solicitar:</p>
            <ul>
              <li><strong>Acesso</strong>: ver todos os dados armazenados sobre você</li>
              <li><strong>Correção</strong>: corrigir dados incompletos ou desatualizados</li>
              <li><strong>Exclusão</strong>: apagar dados desnecessários ou tratados sem consentimento</li>
              <li><strong>Portabilidade</strong>: exportar seus dados em formato estruturado</li>
              <li><strong>Revogação de consentimento</strong>: retirar autorização para comunicações</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato com a escola ou envie uma solicitação pelo formulário específico.</p>
          </Section>

          <Section title="7. Retenção de dados">
            <p>Dados de alunos e responsáveis são mantidos enquanto durar o vínculo com a escola. Após o encerramento, são removidos em até 90 dias, exceto quando necessário para obrigações legais (ex: documentação fiscal — 5 anos).</p>
          </Section>

          <Section title="8. Segurança">
            <p>Utilizamos criptografia em trânsito (TLS 1.3), controle de acesso por papéis (RBAC), Row Level Security no banco de dados e logs de auditoria para todas as operações sensíveis.</p>
          </Section>

          <Section title="9. Contato — DPO">
            <p>Para questões sobre privacidade ou para exercer seus direitos, contate o responsável da escola que utiliza o EduNest. Dúvidas sobre a plataforma: <strong>privacidade@EduNest.com.br</strong></p>
          </Section>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-[#004ac6] hover:underline font-semibold">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="text-base font-bold text-[#1B3A6B] mb-2">{title}</h2>
      <div className="text-sm text-gray-700 space-y-2">{children}</div>
    </section>
  )
}
