import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StudentCard } from '@/components/alunos/student-card'

const alunoBase = {
  id: 'abc12345-0000-0000-0000-000000000000',
  escola_id: 'escola-1',
  nome: 'Enzo Silva',
  dt_nascimento: '2021-03-15',
  foto_url: null,
  status: 'ativo' as const,
  criado_em: '2024-01-01T00:00:00Z',
  turma_nome: 'Maternal I',
  responsavel_nome: 'Maria Silva',
  responsavel_tel: '(11) 98765-4321',
}

describe('StudentCard', () => {
  it('exibe nome do aluno', () => {
    render(<StudentCard aluno={alunoBase} />)
    expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
  })

  it('exibe as iniciais no avatar quando sem foto', () => {
    render(<StudentCard aluno={alunoBase} />)
    expect(screen.getByText('ES')).toBeInTheDocument()
  })

  it('exibe turma do aluno', () => {
    render(<StudentCard aluno={alunoBase} />)
    expect(screen.getByText('Maternal I')).toBeInTheDocument()
  })

  it('exibe responsável e telefone', () => {
    render(<StudentCard aluno={alunoBase} />)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('(11) 98765-4321')).toBeInTheDocument()
  })

  it('exibe badge "Ativo" para aluno ativo', () => {
    render(<StudentCard aluno={alunoBase} />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('exibe badge "Pendente" para aluno pendente', () => {
    render(<StudentCard aluno={{ ...alunoBase, status: 'pendente' }} />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
  })

  it('exibe badge "Inativo" para aluno inativo', () => {
    render(<StudentCard aluno={{ ...alunoBase, status: 'inativo' }} />)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('exibe "—" quando sem turma', () => {
    render(<StudentCard aluno={{ ...alunoBase, turma_nome: null }} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('nome é um link para perfil do aluno', () => {
    render(<StudentCard aluno={alunoBase} />)
    const link = screen.getByRole('link', { name: 'Enzo Silva' })
    expect(link).toHaveAttribute('href', `/alunos/${alunoBase.id}`)
  })

  it('exibe imagem quando foto_url está presente', () => {
    render(<StudentCard aluno={{ ...alunoBase, foto_url: 'https://example.com/foto.jpg' }} />)
    const img = screen.getByRole('img', { name: 'Enzo Silva' })
    expect(img).toHaveAttribute('src', 'https://example.com/foto.jpg')
  })
})
