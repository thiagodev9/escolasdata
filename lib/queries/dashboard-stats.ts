import { db } from '../db'
import { alunos, turmas, feedPosts } from '../schema'
import { eq, and, count } from 'drizzle-orm'

export async function getDashboardStats(escolaId: string) {
  const hoje = new Date()
  const mesHoje = String(hoje.getMonth() + 1).padStart(2, '0')
  const diaHoje = String(hoje.getDate()).padStart(2, '0')

  const [
    ativosRes,
    turmasRes,
    pendentesRes,
    feedRes,
    anivRes,
  ] = await Promise.all([
    db.select({ n: count() }).from(alunos)
      .where(and(eq(alunos.escolaId, escolaId), eq(alunos.status, 'ativo'))),
    db.select({ id: turmas.id, nome: turmas.nome, capacidade: turmas.capacidade })
      .from(turmas).where(eq(turmas.escolaId, escolaId)),
    db.select({ n: count() }).from(alunos)
      .where(and(eq(alunos.escolaId, escolaId), eq(alunos.status, 'pendente'))),
    db.select({ n: count() }).from(feedPosts).where(eq(feedPosts.escolaId, escolaId)),
    db.select({ id: alunos.id, nome: alunos.nome, fotoUrl: alunos.fotoUrl, dtNascimento: alunos.dtNascimento })
      .from(alunos).where(and(eq(alunos.escolaId, escolaId), eq(alunos.status, 'ativo'))),
  ])

  const aniversariantes = anivRes
    .filter(a => {
      if (!a.dtNascimento) return false
      const [, m, d] = a.dtNascimento.split('-')
      return m === mesHoje && d === diaHoje
    })
    .map(a => ({ id: a.id, nome: a.nome, foto_url: a.fotoUrl ?? null }))

  return {
    totalAlunos:  Number(ativosRes[0]?.n   ?? 0),
    totalTurmas:  turmasRes.length,
    turmas:       turmasRes,
    pendentes:    Number(pendentesRes[0]?.n ?? 0),
    totalPosts:   Number(feedRes[0]?.n      ?? 0),
    aniversariantes,
  }
}
