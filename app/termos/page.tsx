import { FileText, Footprints } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso e Contrato de Assinatura — EduNest',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      <header className="bg-[#1B3A6B] text-white px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#2563eb] rounded-md flex items-center justify-center">
            <Footprints className="w-5 h-5 text-white" />
          </div>
          <p className="text-base font-bold">EduNest — Gestão Escolar</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#2563eb]" />
          <h1 className="text-3xl font-bold text-[#1B3A6B]">Termos de Uso e Contrato de Assinatura</h1>
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Última atualização: {new Date().toLocaleDateString('pt-BR')} · Versão 1.0
        </p>

        <div className="bg-white rounded-xl border border-blue-100 p-8 prose prose-sm max-w-none">

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            Este documento regula o relacionamento entre a <strong>KTX Digital</strong> ("Fornecedor") e a escola ou
            instituição de ensino que realiza o cadastro na plataforma <strong>EduNest</strong> ("Contratante"). Ao
            criar uma conta, o representante legal da escola declara ter lido, compreendido e aceito integralmente
            todas as cláusulas abaixo.
          </p>

          <Section title="1. Objeto">
            <p>
              O presente contrato tem por objeto a licença de uso da plataforma de software SaaS <strong>EduNest</strong>,
              desenvolvida e operada pela KTX Digital, destinada à gestão de escolas de educação infantil, abrangendo
              módulos de chamada/presença, diário pedagógico, comunicados, mensalidades, cardápio, portal da família e
              demais funcionalidades disponíveis no plano contratado.
            </p>
          </Section>

          <Section title="2. Partes">
            <p><strong>Fornecedor:</strong> KTX Digital, empresa desenvolvedora e operadora da plataforma EduNest.</p>
            <p>
              <strong>Contratante:</strong> Escola, creche ou instituição de educação infantil cujo representante legal
              realizou o cadastro na plataforma, concordando com estes termos em nome da instituição.
            </p>
          </Section>

          <Section title="3. Planos e Preços">
            <p>O EduNest adota modelo de assinatura com precificação baseada no número de alunos ativos:</p>
            <ul>
              <li><strong>Até 30 alunos:</strong> R$ 97,00 / mês</li>
              <li><strong>31 a 60 alunos:</strong> R$ 147,00 / mês</li>
              <li><strong>61 a 100 alunos:</strong> R$ 197,00 / mês</li>
              <li><strong>Acima de 100 alunos:</strong> R$ 247,00 / mês</li>
            </ul>
            <p>
              Os valores acima são reajustados anualmente pelo <strong>IGP-M</strong> (Índice Geral de Preços — Mercado)
              ou, na sua ausência, pelo IPCA, com notificação prévia de 30 dias ao Contratante.
            </p>
            <p>
              A contratação anual garante desconto de <strong>2 meses grátis</strong> (equivalente a 10 meses no valor
              de 12). O pagamento pode ser realizado mensalmente ou à vista pelo período anual.
            </p>
          </Section>

          <Section title="4. Forma de Pagamento">
            <p>
              As cobranças são realizadas mensalmente via <strong>PIX, boleto bancário ou cartão de crédito</strong>,
              processadas pela plataforma Asaas. O vencimento ocorre no dia 1º de cada mês.
            </p>
            <p>
              O atraso no pagamento superior a <strong>15 dias</strong> resultará na suspensão temporária do acesso à
              plataforma, sem exclusão dos dados. A reativação ocorre automaticamente após a quitação do débito.
              Após 60 dias de inadimplência, o Fornecedor poderá rescindir o contrato e excluir os dados conforme
              cláusula 11.
            </p>
          </Section>

          <Section title="5. Período Mínimo e Cancelamento">
            <p>
              O período mínimo de contratação é de <strong>12 (doze) meses</strong> corridos a partir da data do
              cadastro ("Contrato Anual"). O cancelamento antecipado está sujeito à multa de rescisão conforme tabela:
            </p>
            <ul>
              <li>Cancelamento até o 3º mês: multa de 3 mensalidades</li>
              <li>Cancelamento entre o 4º e o 8º mês: multa de 2 mensalidades</li>
              <li>Cancelamento entre o 9º e o 11º mês: multa de 1 mensalidade</li>
              <li>Cancelamento no 12º mês ou após: sem multa</li>
            </ul>
            <p>
              O cancelamento deve ser solicitado com no mínimo <strong>30 dias de antecedência</strong> via e-mail ou
              pelo painel de configurações da plataforma.
            </p>
          </Section>

          <Section title="6. Renovação Automática">
            <p>
              Ao término do período anual, o contrato é renovado automaticamente por mais 12 meses, salvo manifestação
              contrária do Contratante com antecedência mínima de 30 dias antes do vencimento.
            </p>
          </Section>

          <Section title="7. Obrigações do Fornecedor (KTX Digital)">
            <ul>
              <li>Disponibilizar a plataforma EduNest com disponibilidade mínima de <strong>99,5% ao mês</strong> (SLA), excluídas manutenções programadas comunicadas com antecedência</li>
              <li>Garantir a segurança dos dados por meio de criptografia TLS 1.3, backups diários automáticos e controle de acesso por papéis (RBAC)</li>
              <li>Manter suporte técnico via canal digital em horário comercial (8h–18h, dias úteis), com tempo de resposta de até 24 horas úteis</li>
              <li>Notificar o Contratante com antecedência mínima de 15 dias sobre mudanças relevantes na plataforma ou nos preços</li>
              <li>Tratar os dados pessoais exclusivamente conforme a <Link href="/privacidade" className="text-blue-600 underline">Política de Privacidade</Link> e a LGPD</li>
            </ul>
          </Section>

          <Section title="8. Obrigações do Contratante">
            <ul>
              <li>Manter o pagamento em dia conforme o plano contratado</li>
              <li>Utilizar a plataforma exclusivamente para fins lícitos e relacionados à gestão da instituição de ensino</li>
              <li>Não compartilhar credenciais de acesso com pessoas externas à instituição</li>
              <li>Obter os consentimentos necessários dos responsáveis legais dos alunos para o tratamento de dados pessoais, conforme exigido pela LGPD</li>
              <li>Informar imediatamente o Fornecedor sobre qualquer suspeita de acesso não autorizado à conta</li>
              <li>Manter os dados cadastrados atualizados, especialmente o e-mail e telefone do representante legal</li>
            </ul>
          </Section>

          <Section title="9. Propriedade Intelectual">
            <p>
              Todo o software, código-fonte, marcas, logotipos, design e conteúdos da plataforma EduNest são de
              propriedade exclusiva da KTX Digital. A assinatura concede ao Contratante uma licença de uso limitada,
              não exclusiva e intransferível, restrita ao uso interno da instituição. É vedada a reprodução, cópia,
              engenharia reversa ou redistribuição de qualquer parte da plataforma.
            </p>
          </Section>

          <Section title="10. Dados e Portabilidade">
            <p>
              Os dados inseridos pelo Contratante (alunos, responsáveis, registros, etc.) são de sua propriedade.
              O Contratante pode exportar seus dados a qualquer momento pelo painel da plataforma ou mediante
              solicitação ao suporte.
            </p>
            <p>
              Em caso de encerramento do contrato, os dados ficam disponíveis para exportação por <strong>30 dias</strong>
              após o cancelamento. Decorrido esse prazo, serão excluídos definitivamente dos servidores, exceto quando
              a retenção for exigida por lei.
            </p>
          </Section>

          <Section title="11. Limitação de Responsabilidade">
            <p>
              O Fornecedor não se responsabiliza por danos indiretos, perda de receita, perda de dados por falha do
              Contratante em exportar informações antes do cancelamento, ou por indisponibilidades causadas por força
              maior (falhas de infraestrutura de terceiros, desastres naturais, ataques cibernéticos externos).
            </p>
            <p>
              A responsabilidade total do Fornecedor, em qualquer hipótese, fica limitada ao valor pago pelo
              Contratante nos últimos 3 meses de vigência do contrato.
            </p>
          </Section>

          <Section title="12. Privacidade e LGPD">
            <p>
              O tratamento de dados pessoais coletados pela plataforma é regido pela{' '}
              <Link href="/privacidade" className="text-blue-600 underline">Política de Privacidade</Link> do EduNest,
              parte integrante deste contrato. O Contratante, ao aceitar estes termos, assume a condição de
              <strong> controlador</strong> dos dados dos alunos e responsáveis, sendo a KTX Digital a
              <strong> operadora</strong>, nos termos do Art. 5º, VI e VII da Lei 13.709/2018 (LGPD).
            </p>
          </Section>

          <Section title="13. Alterações nos Termos">
            <p>
              O Fornecedor pode atualizar estes Termos a qualquer momento, notificando o Contratante com
              antecedência mínima de <strong>15 dias</strong> por e-mail. O uso continuado da plataforma após a
              notificação implica na aceitação das novas condições. Caso o Contratante não concorde com as
              alterações, poderá rescindir o contrato sem multa, desde que o faça antes da data de vigência das
              novas condições.
            </p>
          </Section>

          <Section title="14. Disposições Gerais">
            <p>
              Este contrato é regido pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca
              de <strong>São Paulo – SP</strong> para dirimir quaisquer controvérsias decorrentes deste instrumento,
              com renúncia expressa a qualquer outro, por mais privilegiado que seja.
            </p>
            <p>
              Caso qualquer cláusula deste contrato seja declarada nula ou inaplicável, as demais permanecem em
              plena vigência.
            </p>
          </Section>

          <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500 text-center">
            <p>EduNest é uma plataforma da <strong>KTX Digital</strong></p>
            <p className="mt-1">Dúvidas: <strong>contrato@edunest.com.br</strong></p>
          </div>

        </div>

        <div className="flex items-center justify-between mt-8">
          <Link href="/" className="text-sm text-[#2563eb] hover:underline font-semibold">
            ← Voltar ao início
          </Link>
          <Link href="/privacidade" className="text-sm text-[#2563eb] hover:underline font-semibold">
            Política de Privacidade →
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
