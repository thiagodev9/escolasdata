// NFS-e integration via NFe.io (nfe.io)
// Documentação: https://nfe.io/docs/nota-fiscal-servico/

export interface NfsePayload {
  prestador: {
    cnpj:           string
    inscricaoMunicipal: string
    municipio:      string   // IBGE code
  }
  tomador: {
    razaoSocial:   string
    email?:        string
    endereco?: { municipio: string; estado: string }
  }
  servico: {
    valor:          number
    iss:            number   // ISS value
    issAliquota:    number   // e.g. 5.00
    codigoTributarioMunicipio: string
    discriminacao:  string
    competencia:    string   // YYYY-MM
    exigibilidadeISS?: number
    municipioPrestacao?: string
  }
}

export interface NfseResponse {
  id:              string
  status:          'Waiting' | 'Processing' | 'Issued' | 'Cancelled' | 'Error'
  number?:         string
  checkCode?:      string
  rpsNumber?:      string
  issuedAt?:       string
  xmlUrl?:         string
  pdfUrl?:         string
  message?:        string
}

function getBaseUrl() {
  return process.env.NFEIO_BASE_URL ?? 'https://api.nfe.io/v1'
}
function getApiKey(keyOverride?: string) {
  return keyOverride ?? process.env.NFEIO_API_KEY ?? ''
}

export async function emitirNfse(
  companyId: string,
  payload: NfsePayload,
  apiKey?: string,
): Promise<NfseResponse> {
  const key = getApiKey(apiKey)
  if (!key) throw new Error('NFe.io API key não configurada.')

  const res = await fetch(`${getBaseUrl()}/companies/${companyId}/serviceinvoices`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `NFe.io error ${res.status}`)
  }
  return res.json()
}

export async function consultarNfse(
  companyId: string,
  invoiceId:  string,
  apiKey?:    string,
): Promise<NfseResponse> {
  const key = getApiKey(apiKey)
  const res = await fetch(`${getBaseUrl()}/companies/${companyId}/serviceinvoices/${invoiceId}`, {
    headers: { 'Authorization': `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`NFe.io error ${res.status}`)
  return res.json()
}

export async function cancelarNfse(
  companyId: string,
  invoiceId:  string,
  apiKey?:    string,
): Promise<NfseResponse> {
  const key = getApiKey(apiKey)
  const res = await fetch(`${getBaseUrl()}/companies/${companyId}/serviceinvoices/${invoiceId}`, {
    method:  'DELETE',
    headers: { 'Authorization': `Bearer ${key}` },
  })
  if (!res.ok) throw new Error(`NFe.io error ${res.status}`)
  return res.json()
}

// Gera XML ABRASF 2.01 simplificado para emissão manual em prefeituras
export function gerarXmlAbrasf(params: {
  cnpjPrestador:  string
  imPrestador:    string
  razaoSocialPrestador: string
  nomeResponsavel: string
  emailResponsavel?: string
  valor:           number
  issAliquota:     number
  discriminacao:   string
  competencia:     string // YYYY-MM
  municipioIbge:   string
  codigoServico:   string
  rpsNumero:       number
  rpsSerie:        string
}): string {
  const iss = (params.valor * params.issAliquota / 100).toFixed(2)
  const competenciaDate = `${params.competencia}-01`

  return `<?xml version="1.0" encoding="UTF-8"?>
<EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
  <LoteRps>
    <NumeroLote>1</NumeroLote>
    <CpfCnpj><Cnpj>${params.cnpjPrestador.replace(/\D/g, '')}</Cnpj></CpfCnpj>
    <InscricaoMunicipal>${params.imPrestador}</InscricaoMunicipal>
    <QuantidadeRps>1</QuantidadeRps>
    <ListaRps>
      <Rps>
        <InfDeclaracaoPrestacaoServico>
          <Rps>
            <IdentificacaoRps>
              <Numero>${params.rpsNumero}</Numero>
              <Serie>${params.rpsSerie}</Serie>
              <Tipo>1</Tipo>
            </IdentificacaoRps>
            <DataEmissao>${new Date().toISOString().split('T')[0]}</DataEmissao>
            <Status>1</Status>
          </Rps>
          <Competencia>${competenciaDate}</Competencia>
          <Servico>
            <Valores>
              <ValorServicos>${params.valor.toFixed(2)}</ValorServicos>
              <ValorIss>${iss}</ValorIss>
              <Aliquota>${params.issAliquota.toFixed(2)}</Aliquota>
            </Valores>
            <IssRetido>2</IssRetido>
            <ItemListaServico>${params.codigoServico}</ItemListaServico>
            <Discriminacao>${params.discriminacao}</Discriminacao>
            <CodigoMunicipio>${params.municipioIbge}</CodigoMunicipio>
          </Servico>
          <Prestador>
            <CpfCnpj><Cnpj>${params.cnpjPrestador.replace(/\D/g, '')}</Cnpj></CpfCnpj>
            <InscricaoMunicipal>${params.imPrestador}</InscricaoMunicipal>
          </Prestador>
          <Tomador>
            <RazaoSocial>${params.nomeResponsavel}</RazaoSocial>
            ${params.emailResponsavel ? `<Contato><Email>${params.emailResponsavel}</Email></Contato>` : ''}
          </Tomador>
        </InfDeclaracaoPrestacaoServico>
      </Rps>
    </ListaRps>
  </LoteRps>
</EnviarLoteRpsEnvio>`
}

export function isConfigured(): boolean {
  return !!process.env.NFEIO_API_KEY
}
