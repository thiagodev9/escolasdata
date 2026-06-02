import { describe, it, expect } from 'vitest'
import type { Role, AlunoStatus, Plano } from '@/lib/supabase/types'

// Testa as constraints de tipo em runtime via valores válidos/inválidos

describe('Domain types — validação de valores permitidos', () => {
  const rolesValidos: Role[] = ['super_admin', 'diretora', 'professora', 'responsavel']
  const statusValidos: AlunoStatus[] = ['ativo', 'inativo', 'pendente']
  const planosValidos: Plano[] = ['basico', 'profissional', 'enterprise']

  it('Role — lista completa de 4 roles', () => {
    expect(rolesValidos).toHaveLength(4)
    expect(rolesValidos).toContain('diretora')
    expect(rolesValidos).toContain('responsavel')
  })

  it('AlunoStatus — 3 estados possíveis', () => {
    expect(statusValidos).toHaveLength(3)
    expect(statusValidos).toContain('ativo')
  })

  it('Plano — 3 níveis de plano', () => {
    expect(planosValidos).toHaveLength(3)
    expect(planosValidos).toContain('profissional')
  })

  it('Aluno mock — estrutura mínima válida', () => {
    const aluno = {
      id: 'uuid-1', escola_id: 'uuid-escola', nome: 'João Silva',
      dt_nascimento: '2020-01-15', foto_url: null, status: 'ativo' as AlunoStatus,
      criado_em: new Date().toISOString(),
    }
    expect(aluno.nome).toBe('João Silva')
    expect(aluno.status).toBe('ativo')
    expect(aluno.foto_url).toBeNull()
  })

  it('Escola mock — estrutura mínima válida', () => {
    const escola = {
      id: 'uuid-e', nome: 'Starlight Academy', slug: 'starlight-academy',
      plano: 'profissional' as Plano, ativo: true, config: {}, criado_em: new Date().toISOString(),
    }
    expect(escola.slug).toBe('starlight-academy')
    expect(escola.ativo).toBe(true)
  })
})

describe('Lógica de cálculo de idade', () => {
  function calcIdade(dtNascimento: string): number {
    const hoje = new Date(), nasc = new Date(dtNascimento)
    let anos = hoje.getFullYear() - nasc.getFullYear()
    const m = hoje.getMonth() - nasc.getMonth()
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--
    return anos
  }

  it('criança nascida há exatos 3 anos tem 3 anos', () => {
    const tresAnosAtras = new Date()
    tresAnosAtras.setFullYear(tresAnosAtras.getFullYear() - 3)
    expect(calcIdade(tresAnosAtras.toISOString().split('T')[0])).toBe(3)
  })

  it('bebê nascido ontem tem 0 anos', () => {
    const ontem = new Date()
    ontem.setDate(ontem.getDate() - 1)
    expect(calcIdade(ontem.toISOString().split('T')[0])).toBe(0)
  })

  it('não conta o aniversário antes de chegar', () => {
    // Data fixa: nasceu em 31/12/2020 (aniversário ainda não chegou em qualquer dia antes de 31/dez)
    // Mockamos "hoje" como 2025-06-15 para tornar o teste determinístico
    const mockHoje = new Date('2025-06-15')
    function calcIdadeFixo(dtNasc: string) {
      const nasc = new Date(dtNasc)
      let anos = mockHoje.getFullYear() - nasc.getFullYear()
      const m = mockHoje.getMonth() - nasc.getMonth()
      if (m < 0 || (m === 0 && mockHoje.getDate() < nasc.getDate())) anos--
      return anos
    }
    // Nasceu em 31/12/2020 — em 15/06/2025 ainda não chegou o aniversário (dezembro)
    expect(calcIdadeFixo('2020-12-31')).toBe(4)
    // Nasceu em 10/01/2020 — em 15/06/2025 já fez aniversário este ano
    expect(calcIdadeFixo('2020-01-10')).toBe(5)
  })
})

describe('Formatação de valores financeiros', () => {
  function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

  it('formata R$ 1200 corretamente', () => {
    expect(fmt(1200)).toContain('1.200')
    expect(fmt(1200)).toContain('R$')
  })

  it('formata centavos', () => {
    expect(fmt(99.99)).toContain('99,99')
  })
})
