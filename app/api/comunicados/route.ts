import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@/lib/supabase/admin'
import { sendBulk, isConfigured } from '@/lib/evolution/client'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

    const { titulo, mensagem, turmaId, escolaId, escolaNome } = await req.json()

    const admin = createAdmin()

    // Buscar responsáveis com telefone
    let query = (admin as any)
      .from('responsaveis')
      .select('nome, telefone, alunos_responsaveis!inner(aluno:alunos!inner(escola_id))')
      .eq('alunos_responsaveis.aluno.escola_id', escolaId)
      .not('telefone', 'is', null)

    if (turmaId) {
      query = (admin as any)
        .from('responsaveis')
        .select('nome, telefone, alunos_responsaveis!inner(aluno:alunos!inner(escola_id, alunos_turmas!inner(turma_id)))')
        .eq('alunos_responsaveis.aluno.escola_id', escolaId)
        .eq('alunos_responsaveis.aluno.alunos_turmas.turma_id', turmaId)
        .not('telefone', 'is', null)
    }

    const { data: responsaveis } = await query

    if (!responsaveis?.length) {
      return NextResponse.json({ error: 'Nenhum responsável com telefone cadastrado.' }, { status: 400 })
    }

    const recipients = responsaveis.map((r: any) => ({ phone: r.telefone, nome: r.nome }))

    let enviados = 0, falhas = 0

    if (isConfigured()) {
      const result = await sendBulk(recipients, mensagem, escolaNome)
      enviados = result.enviados
      falhas   = result.falhas
    } else {
      // Modo demo: simula envio
      enviados = recipients.length
    }

    // Salvar histórico
    await (admin as any).from('comunicados').insert({
      titulo, mensagem,
      turma_id:   turmaId || null,
      escola_id:  escolaId,
      enviado_por: user.id,
      canal: 'whatsapp',
      enviados, falhas,
    })

    return NextResponse.json({ ok: true, enviados, falhas, total: recipients.length })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
