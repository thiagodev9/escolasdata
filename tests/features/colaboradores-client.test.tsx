import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColaboradoresClient } from '@/components/colaboradores/colaboradores-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

const colaboradoresMock = [
  {
    id: 'c1', escola_id: 'e1', nome: 'Ana Professora', email: 'ana@escola.com',
    telefone: '(11) 99999-1111', cpf: '111.111.111-11', cargo: 'professora',
    cep: null, rua: null, numero: null, complemento: null, bairro: null,
    cidade: 'São Paulo', estado: 'SP',
    dt_admissao: '2022-03-01', dt_venc_ferias: '2024-03-01',
    salario: 3500, observacoes: null, ativo: true, criado_em: '2022-03-01T00:00:00Z',
  },
  {
    id: 'c2', escola_id: 'e1', nome: 'Maria Diretora', email: 'maria@escola.com',
    telefone: '(11) 99999-2222', cpf: '222.222.222-22', cargo: 'diretora',
    cep: null, rua: null, numero: null, complemento: null, bairro: null,
    cidade: null, estado: null,
    dt_admissao: '2018-01-15', dt_venc_ferias: null,
    salario: 8000, observacoes: 'Fundadora', ativo: true, criado_em: '2018-01-15T00:00:00Z',
  },
  {
    id: 'c3', escola_id: 'e1', nome: 'João Porteiro', email: null,
    telefone: '(11) 99999-3333', cpf: null, cargo: 'porteiro',
    cep: null, rua: null, numero: null, complemento: null, bairro: null,
    cidade: null, estado: null,
    dt_admissao: null, dt_venc_ferias: null,
    salario: null, observacoes: null, ativo: false, criado_em: '2020-06-01T00:00:00Z',
  },
]

describe('ColaboradoresClient — renderização', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe título', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    expect(screen.getByText(/colaboradores/i)).toBeInTheDocument()
  })

  it('renderiza todos os colaboradores', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    expect(screen.getByText('Ana Professora')).toBeInTheDocument()
    expect(screen.getByText('Maria Diretora')).toBeInTheDocument()
    expect(screen.getByText('João Porteiro')).toBeInTheDocument()
  })

  it('exibe badges de cargo para os colaboradores', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    // "Professora" aparece em múltiplos lugares (badge + opção de select no modal)
    const items = screen.getAllByText('Professora')
    expect(items.length).toBeGreaterThan(0)
  })

  it('exibe badge Diretora', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    const items = screen.getAllByText('Diretora')
    expect(items.length).toBeGreaterThan(0)
  })

  it('filtra colaboradores pelo campo de busca', async () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    const input = screen.getByPlaceholderText('Buscar...')
    await userEvent.type(input, 'Maria')
    expect(screen.getByText('Maria Diretora')).toBeInTheDocument()
    expect(screen.queryByText('Ana Professora')).not.toBeInTheDocument()
  })

  it('exibe colaboradores inativos na lista', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    expect(screen.getByText('João Porteiro')).toBeInTheDocument()
  })

  it('exibe data de admissão formatada', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    expect(screen.getByText(/01\/03\/2022/i)).toBeInTheDocument()
  })
})

describe('ColaboradoresClient — modal novo colaborador', () => {
  beforeEach(() => vi.clearAllMocks())

  it('abre modal ao clicar em Novo Colaborador', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))
    expect(screen.getByRole('heading', { name: /novo colaborador/i })).toBeInTheDocument()
  })

  it('modal contém campo de nome obrigatório', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))
    expect(screen.getByText('Nome completo *')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ex: Maria Silva')).toBeInTheDocument()
  })

  it('modal tem abas Dados Pessoais, Endereço, Contrato', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))
    expect(screen.getByRole('button', { name: 'Dados Pessoais' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Endereço' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Contrato' })).toBeInTheDocument()
  })

  it('exibe erro ao tentar salvar sem nome (navegando até última aba)', async () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))
    // Avança até a aba "Contrato" (3ª aba) onde fica o botão Adicionar
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))
    await waitFor(() => {
      expect(screen.getByText('Nome é obrigatório')).toBeInTheDocument()
    })
  })

  it('fecha modal ao clicar em Cancelar', () => {
    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('heading', { name: /novo colaborador/i })).not.toBeInTheDocument()
  })

  it('chama supabase.insert ao salvar colaborador com nome preenchido', async () => {
    const insertMock = createSupabaseMock({ data: { id: 'novo-c1' }, error: null })
    mockSupabaseClient.from.mockReturnValueOnce(insertMock)

    render(<ColaboradoresClient colaboradores={colaboradoresMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo colaborador/i }))

    await userEvent.type(screen.getByPlaceholderText('Ex: Maria Silva'), 'Novo Funcionário')
    // Avança até a aba "Contrato"
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }))
    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('colaboradores')
    })
  })
})

describe('ColaboradoresClient — lista vazia', () => {
  it('exibe mensagem quando não há colaboradores', () => {
    render(<ColaboradoresClient colaboradores={[]} escolaId="e1" />)
    expect(screen.getByText(/nenhum colaborador/i)).toBeInTheDocument()
  })
})
