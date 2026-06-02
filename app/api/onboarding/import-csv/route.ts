import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

interface CsvRow {
  nome: string
  nascimento: string
  turma: string
  responsavel: string
  telefone: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

    const admin = createClient()
    const { data: usuario } = await (admin as any)
      .from('usuarios')
      .select('escola_id, role')
      .eq('id', user.id)
      .single() as { data: { escola_id: string; role: string } | null }

    if (!usuario || !['diretora', 'super_admin'].includes(usuario.role)) {
      return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
    }

    const { rows }: { rows: CsvRow[] } = await request.json()
    if (!rows?.length) return NextResponse.json({ error: 'Nenhuma linha encontrada.' }, { status: 400 })

    const escolaId = usuario.escola_id

    // Buscar turmas existentes
    const { data: turmasExist } = await (admin as any)
      .from('turmas')
      .select('id, nome')
      .eq('escola_id', escolaId) as { data: { id: string; nome: string }[] | null }

    const turmaMap = new Map((turmasExist ?? []).map(t => [t.nome.toLowerCase(), t.id]))

    let criados = 0; let erros = 0

    for (const row of rows) {
      try {
        if (!row.nome?.trim() || !row.nascimento?.trim()) { erros++; continue }

        // Criar turma se não existir
        let turmaId: string | null = null
        if (row.turma?.trim()) {
          const turmaKey = row.turma.trim().toLowerCase()
          if (turmaMap.has(turmaKey)) {
            turmaId = turmaMap.get(turmaKey)!
          } else {
            const { data: novaTurma } = await (admin as any)
              .from('turmas')
              .insert({ nome: row.turma.trim(), escola_id: escolaId, capacidade: 25 })
              .select('id')
              .single() as { data: { id: string } | null }
            if (novaTurma) {
              turmaId = novaTurma.id
              turmaMap.set(turmaKey, novaTurma.id)
            }
          }
        }

        // Criar aluno
        const { data: aluno } = await (admin as any)
          .from('alunos')
          .insert({
            nome:           row.nome.trim(),
            dt_nascimento:  normalizarData(row.nascimento.trim()),
            escola_id:      escolaId,
            status:         'ativo',
          })
          .select('id')
          .single() as { data: { id: string } | null }

        if (!aluno) { erros++; continue }

        // Vincular turma
        if (turmaId) {
          await (admin as any).from('alunos_turmas').insert({ aluno_id: aluno.id, turma_id: turmaId })
        }

        // Criar responsável
        if (row.responsavel?.trim() && row.telefone?.trim()) {
          const { data: resp } = await (admin as any)
            .from('responsaveis')
            .insert({
              nome:      row.responsavel.trim(),
              telefone:  row.telefone.trim(),
              email:     row.email?.trim() || null,
              escola_id: escolaId,
            })
            .select('id')
            .single() as { data: { id: string } | null }

          if (resp) {
            await (admin as any).from('alunos_responsaveis').insert({
              aluno_id:      aluno.id,
              responsavel_id: resp.id,
              parentesco:    'pai/mãe',
            })
          }
        }

        criados++
      } catch {
        erros++
      }
    }

    return NextResponse.json({ criados, erros })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function normalizarData(s: string): string {
  // Aceita dd/mm/yyyy ou yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const [d, m, y] = s.split('/')
  if (y && m && d) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  return s
}
