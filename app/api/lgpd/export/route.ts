import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios').select('escola_id, role').eq('id', user.id).single() as { data: { escola_id: string; role: string } | null }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const email = request.nextUrl.searchParams.get('email')
    if (!email) return NextResponse.json({ error: 'email é obrigatório' }, { status: 400 })

    const escolaId = usuario.escola_id

    // Buscar responsável
    const { data: resp } = await (admin as any)
      .from('responsaveis')
      .select('*, alunos_responsaveis(aluno:alunos(*))')
      .eq('escola_id', escolaId)
      .ilike('email', email)
      .maybeSingle() as { data: any }

    if (!resp) {
      return NextResponse.json({ error: 'Responsável não encontrado.' }, { status: 404 })
    }

    // Buscar registros do diário para os alunos vinculados
    const alunosIds = (resp.alunos_responsaveis ?? []).map((ar: any) => ar.aluno?.id).filter(Boolean)

    const { data: diario } = await (admin as any)
      .from('registros_diarios')
      .select('tipo, titulo, descricao, data, criado_em')
      .in('aluno_id', alunosIds)
      .eq('escola_id', escolaId) as { data: any[] | null }

    const { data: presencas } = await (admin as any)
      .from('presencas')
      .select('data, presente')
      .in('aluno_id', alunosIds)
      .eq('escola_id', escolaId) as { data: any[] | null }

    const exportData = {
      exportado_em: new Date().toISOString(),
      responsavel: {
        nome:      resp.nome,
        email:     resp.email,
        telefone:  resp.telefone,
        criado_em: resp.criado_em,
      },
      alunos: (resp.alunos_responsaveis ?? []).map((ar: any) => ({
        nome:           ar.aluno?.nome,
        dt_nascimento:  ar.aluno?.dt_nascimento,
        status:         ar.aluno?.status,
        criado_em:      ar.aluno?.criado_em,
      })),
      registros_diarios: diario ?? [],
      presencas: presencas ?? [],
    }

    // Registrar no audit log
    await (admin as any).from('audit_log').insert({
      escola_id:   escolaId,
      usuario_id:  user.id,
      acao:        'lgpd_export',
      tabela:      'responsaveis',
      registro_id: resp.id,
      detalhes:    { email },
    })

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="dados_${email.replace('@','_')}.json"`,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
