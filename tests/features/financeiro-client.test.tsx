import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FinanceiroClient } from '@/components/financeiro/financeiro-client'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const cobrancasMock = [
  { id:'1', customerName:'Maria Silva',  billingType:'PIX',   value:1200, dueDate:'2024-06-10', status:'PENDING',  description:'Mensalidade Junho' },
  { id:'2', customerName:'João Costa',   billingType:'BOLETO', value:800, dueDate:'2024-06-05', status:'OVERDUE',  description:'Mensalidade Maio'  },
  { id:'3', customerName:'Ana Oliveira', billingType:'CREDIT_CARD', value:1200, dueDate:'2024-06-05', status:'RECEIVED', description:'Mensalidade Junho' },
  { id:'4', customerName:'Carlos Lima',  billingType:'PIX',   value:1200, dueDate:'2024-06-10', status:'CANCELLED',description:'Mensalidade Abril' },
]

const alunosMock = [
  { id:'a1', nome:'Enzo Silva', alunos_responsaveis: [{ responsavel: { nome:'Maria Silva', email:'maria@test.com', telefone:'11999' } }] },
  { id:'a2', nome:'Ana Costa',  alunos_responsaveis: [] },
]

describe('FinanceiroClient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza todas as cobranças', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.getByText('João Costa')).toBeInTheDocument()
    expect(screen.getByText('Ana Oliveira')).toBeInTheDocument()
  })

  it('filtra por "Pendente" corretamente', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pendente' }))
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.queryByText('João Costa')).not.toBeInTheDocument()
    expect(screen.queryByText('Ana Oliveira')).not.toBeInTheDocument()
  })

  it('filtra por "Vencido" corretamente', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Vencido' }))
    expect(screen.getByText('João Costa')).toBeInTheDocument()
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
  })

  it('filtra por "Recebido" corretamente', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: 'Recebido' }))
    expect(screen.getByText('Ana Oliveira')).toBeInTheDocument()
    expect(screen.queryByText('Maria Silva')).not.toBeInTheDocument()
  })

  it('busca por nome do responsável', async () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    const search = screen.getByPlaceholderText(/buscar/i)
    await userEvent.type(search, 'Maria')
    expect(screen.getByText('Maria Silva')).toBeInTheDocument()
    expect(screen.queryByText('João Costa')).not.toBeInTheDocument()
  })

  it('exibe "Nenhuma cobrança" quando filtro não tem resultados', async () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    const search = screen.getByPlaceholderText(/buscar/i)
    await userEvent.type(search, 'xyz-inexistente')
    expect(screen.getByText(/nenhuma cobrança encontrada/i)).toBeInTheDocument()
  })

  it('abre modal de nova cobrança', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: /nova cobrança/i }))
    expect(screen.getByRole('heading', { name: /nova cobrança/i })).toBeInTheDocument()
  })

  it('modal lista alunos disponíveis', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: /nova cobrança/i }))
    expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
    expect(screen.getByText('Ana Costa')).toBeInTheDocument()
  })

  it('preenche responsável automaticamente ao selecionar aluno', async () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: /nova cobrança/i }))
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'a1')
    const nomeInput = screen.getByPlaceholderText(/auto-preenchido/i) as HTMLInputElement
    expect(nomeInput.value).toBe('Maria Silva')
  })

  it('exibe aviso quando Asaas não está ativo', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: /nova cobrança/i }))
    expect(screen.getByText(/asaas não configurado/i)).toBeInTheDocument()
  })

  it('exibe contagem de cobranças no rodapé', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    expect(screen.getByText(/4 cobranças/i)).toBeInTheDocument()
  })

  it('seletor de tipo PIX/BOLETO/CARTÃO funciona', () => {
    render(<FinanceiroClient cobrancas={cobrancasMock as any} alunos={alunosMock} asaasAtivo={false} />)
    fireEvent.click(screen.getByRole('button', { name: /nova cobrança/i }))
    const boletoBtns = screen.getAllByText('BOLETO')
    fireEvent.click(boletoBtns[boletoBtns.length - 1])
    expect(screen.getByRole('button', { name: /gerar boleto/i })).toBeInTheDocument()
  })
})
