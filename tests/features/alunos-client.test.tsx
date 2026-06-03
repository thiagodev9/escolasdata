import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AlunosClient } from '@/components/alunos/alunos-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }), useTransition: () => [false, (fn: any) => fn()] }))

const turmasMock = [
  { id: 't1', nome: 'Maternal I' },
  { id: 't2', nome: 'Jardim II' },
]

const alunosMock = [
  {
    id: 'a1', nome: 'Enzo Silva', dt_nascimento: '2020-05-10', status: 'ativo' as const,
    foto_url: null, escola_id: 'e1', turma_nome: 'Maternal I', turma_id: 't1',
    responsavel_nome: 'Carlos Silva', responsavel_tel: '(11) 99999-0001',
  },
  {
    id: 'a2', nome: 'Maria Costa', dt_nascimento: '2019-03-22', status: 'pendente' as const,
    foto_url: null, escola_id: 'e1', turma_nome: 'Jardim II', turma_id: 't2',
    responsavel_nome: 'Ana Costa', responsavel_tel: '(11) 99999-0002',
  },
  {
    id: 'a3', nome: 'Pedro Lima', dt_nascimento: '2021-08-15', status: 'inativo' as const,
    foto_url: null, escola_id: 'e1', turma_nome: null, turma_id: null,
    responsavel_nome: null, responsavel_tel: null,
  },
]

describe('AlunosClient — renderização', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe título e subtítulo', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('Lista de Alunos')).toBeInTheDocument()
  })

  it('exibe total de alunos no card de KPI', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('exibe contagem de pendentes no KPI', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renderiza todos os alunos na lista', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Costa')).toBeInTheDocument()
    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
  })

  it('filtra alunos pelo campo de busca', async () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    const input = screen.getByPlaceholderText('Buscar aluno...')
    await userEvent.type(input, 'Maria')
    expect(screen.getByText('Maria Costa')).toBeInTheDocument()
    expect(screen.queryByText('Enzo Silva')).not.toBeInTheDocument()
  })

  it('exibe mensagem quando busca não encontra resultados', async () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    await userEvent.type(screen.getByPlaceholderText('Buscar aluno...'), 'xyzxyz')
    expect(screen.queryByText('Enzo Silva')).not.toBeInTheDocument()
  })
})

describe('AlunosClient — modal novo aluno', () => {
  beforeEach(() => vi.clearAllMocks())

  it('abre modal ao clicar em Novo Aluno', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    expect(screen.getByRole('heading', { name: /novo aluno/i })).toBeInTheDocument()
  })

  it('modal contém campos de nome, nascimento e turma', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    expect(screen.getByPlaceholderText(/Ana Oliveira/i)).toBeInTheDocument()
    expect(screen.getByText('Data de nascimento *')).toBeInTheDocument()
    expect(screen.getByText('Turma *')).toBeInTheDocument()
  })

  it('modal exibe seção de responsáveis', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    expect(screen.getAllByText(/responsáveis/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/portal da família/i).length).toBeGreaterThan(0)
  })

  it('campo email aparece na seção de responsável', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    expect(screen.getByPlaceholderText('nome@email.com')).toBeInTheDocument()
  })

  it('exibe erros de validação ao salvar sem preencher campos obrigatórios', async () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    fireEvent.click(screen.getByRole('button', { name: /salvar aluno/i }))
    await waitFor(() => {
      expect(screen.getByText(/nome do aluno é obrigatório/i)).toBeInTheDocument()
    })
  })

  it('exibe erro ao salvar sem turma', async () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    await userEvent.type(screen.getByPlaceholderText(/Ana Oliveira/i), 'João Teste')
    fireEvent.click(screen.getByRole('button', { name: /salvar aluno/i }))
    await waitFor(() => {
      expect(screen.getByText(/turma é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('fecha modal ao clicar em Cancelar', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('heading', { name: /novo aluno/i })).not.toBeInTheDocument()
  })

  it('botão "Adicionar outro responsável" adiciona novo campo', () => {
    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))
    const addBtn = screen.getByRole('button', { name: /adicionar outro responsável/i })
    fireEvent.click(addBtn)
    const headers = screen.getAllByText(/responsável/i)
    expect(headers.length).toBeGreaterThan(1)
  })

  it('chama supabase ao salvar aluno válido', async () => {
    const insertAluno = createSupabaseMock({ data: { id: 'novo-a1' }, error: null })
    const insertResp  = createSupabaseMock({ data: { id: 'novo-r1' }, error: null })
    const insertAR    = createSupabaseMock({ data: {}, error: null })
    const insertAT    = createSupabaseMock({ data: {}, error: null })

    mockSupabaseClient.from
      .mockReturnValueOnce(insertAluno)
      .mockReturnValueOnce(insertResp)
      .mockReturnValueOnce(insertAR)
      .mockReturnValueOnce(insertAT)

    render(<AlunosClient alunos={alunosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo aluno/i }))

    await userEvent.type(screen.getByPlaceholderText(/Ana Oliveira/i), 'João Novo')

    const inputs = document.querySelectorAll('input[type="date"]')
    if (inputs.length > 0) fireEvent.change(inputs[0], { target: { value: '2020-01-15' } })

    const selects = document.querySelectorAll('select')
    if (selects.length > 0) fireEvent.change(selects[0], { target: { value: 't1' } })

    const nomeRespInput = screen.getByPlaceholderText(/Carlos Oliveira/i)
    await userEvent.type(nomeRespInput, 'Pai João')

    const telInputs = screen.getAllByPlaceholderText(/\(11\)/i)
    await userEvent.type(telInputs[0], '11999990000')

    fireEvent.click(screen.getByRole('button', { name: /salvar aluno/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('alunos')
    })
  })
})

describe('AlunosClient — lista vazia', () => {
  it('exibe mensagem quando não há alunos', () => {
    render(<AlunosClient alunos={[]} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText(/nenhum aluno cadastrado/i)).toBeInTheDocument()
  })

  it('exibe 0 no KPI de total', () => {
    render(<AlunosClient alunos={[]} turmas={turmasMock} escolaId="e1" />)
    const totais = screen.getAllByText('0')
    expect(totais.length).toBeGreaterThan(0)
  })
})
