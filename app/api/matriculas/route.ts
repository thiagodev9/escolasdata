import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // 🔐 Rate limit: 10 matrículas por IP a cada 10 minutos
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  const rl = checkRateLimit(`matricula:${ip}`, { windowMs: 10 * 60 * 1000, max: 10 })
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas solicitações. Aguarde alguns minutos e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const {
      escola_id, aluno_nome, aluno_nascimento, turma_interesse,
      resp_nome, resp_email, resp_telefone, resp_parentesco,
    } = body

    if (!escola_id || !aluno_nome || !aluno_nascimento || !resp_nome || !resp_telefone) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 })
    }

    // Validações básicas de formato
    if (typeof aluno_nome !== 'string' || aluno_nome.trim().length < 2) {
      return NextResponse.json({ error: 'Nome do aluno inválido.' }, { status: 400 })
    }
    if (resp_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resp_email)) {
      return NextResponse.json({ error: 'E-mail do responsável inválido.' }, { status: 400 })
    }

    const admin = createClient()

    const { data: escola } = await (admin as any)
      .from('escolas')
      .select('id, nome')
      .eq('id', escola_id)
      .eq('ativo', true)
      .single() as { data: { id: string; nome: string } | null }

    if (!escola) {
      return NextResponse.json({ error: 'Escola não encontrada.' }, { status: 404 })
    }

    const { data, error } = await (admin as any)
      .from('matriculas')
      .insert({
        escola_id,
        aluno_nome:       aluno_nome.trim(),
        aluno_nascimento,
        turma_interesse:  turma_interesse?.trim() || null,
        resp_nome:        resp_nome.trim(),
        resp_email:       resp_email?.trim() || null,
        resp_telefone:    resp_telefone.trim(),
        resp_parentesco:  resp_parentesco?.trim() || 'pai/mãe',
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, escola_nome: escola.nome })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro ao salvar matrícula.' }, { status: 500 })
  }
}
