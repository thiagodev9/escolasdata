const BASE = process.env.EVOLUTION_API_URL  ?? ''
const KEY  = process.env.EVOLUTION_API_KEY  ?? ''
const INSTANCE = process.env.EVOLUTION_INSTANCE ?? 'educare'

interface SendResult { status: 'ok' | 'error'; phone: string; error?: string }

async function post(path: string, body: object) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Evolution ${res.status}: ${await res.text()}`)
  return res.json()
}

// Normaliza telefone para formato WhatsApp (5511999999999)
function normalizePhone(tel: string): string {
  const digits = tel.replace(/\D/g, '')
  if (digits.startsWith('55')) return digits
  if (digits.length === 11) return `55${digits}`
  if (digits.length === 10) return `55${digits}`
  return digits
}

export async function sendText(phone: string, text: string): Promise<SendResult> {
  try {
    await post(`/message/sendText/${INSTANCE}`, {
      number: normalizePhone(phone),
      textMessage: { text },
    })
    return { status: 'ok', phone }
  } catch (e: any) {
    return { status: 'error', phone, error: e.message }
  }
}

export async function sendBulk(
  recipients: Array<{ phone: string; nome: string }>,
  template: string,
  nomeEscola: string
): Promise<{ enviados: number; falhas: number }> {
  let enviados = 0, falhas = 0
  for (const r of recipients) {
    const mensagem = template
      .replace('{nome}', r.nome)
      .replace('{escola}', nomeEscola)
    const result = await sendText(r.phone, mensagem)
    if (result.status === 'ok') enviados++
    else falhas++
    // Rate limit: 1 msg/segundo para evitar ban
    await new Promise(res => setTimeout(res, 1000))
  }
  return { enviados, falhas }
}

export async function sendPresencaAlert(
  phoneResponsavel: string,
  nomeAluno: string,
  horaEntrada: string,
  nomeEscola: string
): Promise<SendResult> {
  const text = `✅ *${nomeEscola}*\n\n${nomeAluno} chegou na escola às ${horaEntrada}.\n\nAcompanhe o dia pelo app EduCare. 🎒`
  return sendText(phoneResponsavel, text)
}

export async function sendCobrancaAviso(
  phoneResponsavel: string,
  nomeResponsavel: string,
  valorVencido: string,
  nomeEscola: string
): Promise<SendResult> {
  const text = `⚠️ *${nomeEscola}*\n\nOlá, ${nomeResponsavel}!\n\nVocê tem uma mensalidade em aberto no valor de ${valorVencido}.\n\nPague via PIX ou boleto pelo app EduCare. 📲`
  return sendText(phoneResponsavel, text)
}

export function isConfigured(): boolean {
  return !!(BASE && KEY && BASE !== 'https://sua-evolution-api.com')
}
