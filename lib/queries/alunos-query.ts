import { db } from '../db'
import { alunos, turmas, alunosTurmas, responsaveis, alunosResponsaveis } from '../schema'
import { eq, asc } from 'drizzle-orm'
import type { AlunoStatus } from '@/lib/supabase/types'

export async function getAlunosComDetalhes(escolaId: string) {
  const [alunosBase, turmasJoin, respJoin] = await Promise.all([
    db.select({
      id: alunos.id,
      nome: alunos.nome,
      dt_nascimento: alunos.dtNascimento,
      foto_url: alunos.fotoUrl,
      status: alunos.status,
      criado_em: alunos.criadoEm,
    })
    .from(alunos)
    .where(eq(alunos.escolaId, escolaId))
    .orderBy(asc(alunos.nome)),

    db.select({ alunoId: alunosTurmas.alunoId, turmaId: turmas.id, turmaNome: turmas.nome })
      .from(alunosTurmas)
      .innerJoin(turmas, eq(turmas.id, alunosTurmas.turmaId))
      .where(eq(turmas.escolaId, escolaId)),

    db.select({ alunoId: alunosResponsaveis.alunoId, respNome: responsaveis.nome, respTel: responsaveis.telefone })
      .from(alunosResponsaveis)
      .innerJoin(responsaveis, eq(responsaveis.id, alunosResponsaveis.responsavelId))
      .where(eq(responsaveis.escolaId, escolaId)),
  ])

  const turmaMap  = Object.fromEntries(turmasJoin.map(r => [r.alunoId, r]))
  const respMap   = Object.fromEntries(respJoin.map(r => [r.alunoId, r]))

  return alunosBase.map(a => ({
    ...a,
    escola_id:        escolaId,
    status:           (a.status ?? 'ativo') as AlunoStatus,
    turma_id:         turmaMap[a.id]?.turmaId   ?? null,
    turma_nome:       turmaMap[a.id]?.turmaNome  ?? null,
    responsavel_nome: respMap[a.id]?.respNome    ?? null,
    responsavel_tel:  respMap[a.id]?.respTel     ?? null,
    alunos_turmas: turmaMap[a.id]
      ? [{ turma: { id: turmaMap[a.id].turmaId, nome: turmaMap[a.id].turmaNome } }]
      : [],
    alunos_responsaveis: respMap[a.id]
      ? [{ responsaveis: { nome: respMap[a.id].respNome, telefone: respMap[a.id].respTel } }]
      : [],
  }))
}

export async function getTurmasList(escolaId: string) {
  return db.select({ id: turmas.id, nome: turmas.nome })
    .from(turmas)
    .where(eq(turmas.escolaId, escolaId))
    .orderBy(asc(turmas.nome))
}
