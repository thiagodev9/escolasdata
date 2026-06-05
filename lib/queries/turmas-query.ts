import { db } from '../db'
import { turmas, usuarios, alunos, alunosTurmas } from '../schema'
import { eq, and, asc } from 'drizzle-orm'

export async function getTurmasComDetalhes(escolaId: string) {
  const [turmasBase, alunosJoin, professoresBase] = await Promise.all([
    db.select({
      id:          turmas.id,
      escola_id:   turmas.escolaId,
      nome:        turmas.nome,
      capacidade:  turmas.capacidade,
      ano_letivo:  turmas.anoLetivo,
      professor_id: turmas.professorId,
      criado_em:   turmas.criadoEm,
      prof_nome:   usuarios.nome,
    })
    .from(turmas)
    .leftJoin(usuarios, eq(usuarios.id, turmas.professorId))
    .where(eq(turmas.escolaId, escolaId))
    .orderBy(asc(turmas.nome)),

    db.select({
      turmaId:  alunosTurmas.turmaId,
      alunoId:  alunos.id,
      nome:     alunos.nome,
      fotoUrl:  alunos.fotoUrl,
      status:   alunos.status,
    })
    .from(alunosTurmas)
    .innerJoin(alunos, eq(alunos.id, alunosTurmas.alunoId))
    .where(eq(alunos.escolaId, escolaId)),

    db.select({ id: usuarios.id, nome: usuarios.nome })
      .from(usuarios)
      .where(and(eq(usuarios.escolaId, escolaId), eq(usuarios.role, 'professora')))
      .orderBy(asc(usuarios.nome)),
  ])

  // Agrupa alunos por turma
  const alunosByTurma = new Map<string, typeof alunosJoin>()
  for (const row of alunosJoin) {
    if (!alunosByTurma.has(row.turmaId)) alunosByTurma.set(row.turmaId, [])
    alunosByTurma.get(row.turmaId)!.push(row)
  }

  const turmasFormatadas = turmasBase.map(t => ({
    id:          t.id,
    escola_id:   t.escola_id,
    nome:        t.nome,
    capacidade:  t.capacidade,
    ano_letivo:  t.ano_letivo,
    professor_id: t.professor_id ?? null,
    criado_em:   t.criado_em,
    professor:   t.professor_id && t.prof_nome
      ? { id: t.professor_id, nome: t.prof_nome }
      : null,
    alunos_turmas: (alunosByTurma.get(t.id) ?? []).map(a => ({
      aluno: { id: a.alunoId, nome: a.nome, foto_url: a.fotoUrl ?? null, status: a.status ?? 'ativo' },
    })),
  }))

  return { turmas: turmasFormatadas, professores: professoresBase }
}
