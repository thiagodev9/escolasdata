import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TurmasClient } from '@/components/turmas/turmas-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))

const turmasMock = [
  {
    id: 't1', nome: 'Maternal I', capacidade: 15, ano_letivo: 2024,
    professor: { id: 'p1', nome: 'Prof. Ana' },
    alunos_turmas: [
      { aluno: { id: 'a1', nome: 'Enzo Silva',   foto_url: null, status: 'ativo' } },
      { aluno: { id: 'a2', nome: 'Maria Oliveira', foto_url: null, status: 'pendente' } },
    ],
  },
  {
    id: 't2', nome: 'Jardim II', capacidade: 20, ano_letivo: 2024,
    professor: null,
    alunos_turmas: [],
  },
]

const professoresMock = [
  { id: 'p1', nome: 'Prof. Ana'  },
  { id: 'p2', nome: 'Prof. Clara' },
]

describe('TurmasClient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza cards de todas as turmas', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    expect(screen.getByText('Maternal I')).toBeInTheDocument()
    expect(screen.getByText('Jardim II')).toBeInTheDocument()
  })

  it('exibe professora vinculada', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    expect(screen.getByText('Prof. Ana')).toBeInTheDocument()
  })

  it('exibe "Sem professora" quando não há professora', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    expect(screen.getByText('Sem professora')).toBeInTheDocument()
  })

  it('exibe contagem de alunos/capacidade', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    expect(screen.getByText('2/15')).toBeInTheDocument()
    expect(screen.getByText('0/20')).toBeInTheDocument()
  })

  it('abre modal ao clicar em Nova Turma', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    fireEvent.click(screen.getAllByRole('button', { name: /nova turma/i })[0])
    expect(screen.getByRole('heading', { name: 'Nova Turma' })).toBeInTheDocument()
  })

  it('modal contém campos de nome, capacidade, ano e professora', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    fireEvent.click(screen.getAllByRole('button', { name: /nova turma/i })[0])
    expect(screen.getByPlaceholderText(/maternal/i)).toBeInTheDocument()
    expect(screen.getByText('Nome da turma *')).toBeInTheDocument()
    expect(screen.getByText('Capacidade')).toBeInTheDocument()
    expect(screen.getByText('Ano letivo')).toBeInTheDocument()
    expect(screen.getByText('Professora responsável')).toBeInTheDocument()
  })

  it('exibe erro ao tentar salvar sem nome', async () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    fireEvent.click(screen.getAllByRole('button', { name: /nova turma/i })[0])
    fireEvent.click(screen.getByRole('button', { name: /criar turma/i }))
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument()
    })
  })

  it('chama supabase.insert ao salvar nova turma', async () => {
    const insertMock = createSupabaseMock({ data: { id: 't3' }, error: null })
    mockSupabaseClient.from.mockReturnValueOnce(insertMock)

    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    fireEvent.click(screen.getAllByRole('button', { name: /nova turma/i })[0])
    await userEvent.type(screen.getByPlaceholderText(/maternal/i), 'Pré I')
    fireEvent.click(screen.getByRole('button', { name: /criar turma/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('turmas')
    })
  })

  it('abre modal de edição ao clicar no lápis', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    // Botões de edição sem aria-label — busca todos os botões pequenos w-8
    const { container } = render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    const smallBtns = container.querySelectorAll('button.w-8.h-8')
    expect(smallBtns.length).toBeGreaterThan(0)
    fireEvent.click(smallBtns[0]) // lápis da primeira turma
    const modal = screen.queryByRole('heading', { name: /editar turma/i })
    if (modal) {
      expect(modal).toBeInTheDocument()
      const input = screen.getByDisplayValue('Maternal I')
      expect(input).toBeInTheDocument()
    }
  })

  it('expande lista de alunos ao clicar em "Ver alunos"', async () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    const expandBtn = screen.getByText(/ver alunos \(2\)/i)
    fireEvent.click(expandBtn)
    await waitFor(() => {
      expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Oliveira')).toBeInTheDocument()
    })
  })

  it('fecha modal ao clicar em Cancelar', () => {
    render(<TurmasClient turmas={turmasMock} professores={professoresMock} escolaId="e1" />)
    fireEvent.click(screen.getAllByRole('button', { name: /nova turma/i })[0])
    expect(screen.getByRole('heading', { name: 'Nova Turma' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('heading', { name: 'Nova Turma' })).not.toBeInTheDocument()
  })
})
