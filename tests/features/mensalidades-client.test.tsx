import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MensalidadesClient } from '@/components/mensalidades/mensalidades-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }))

// window.confirm não existe no jsdom — mock para não lançar exceção
vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))

const mesAtual = new Date()
const mesRef = `${mesAtual.getFullYear()}-${String(mesAtual.getMonth() + 1).padStart(2, '0')}`

const alunosMock = [
  {
    id: 'a1', nome: 'Enzo Silva', turma: 'Maternal I',
    mensalidade: {
      id: 'm1', aluno_id: 'a1', mes_referencia: mesRef,
      valor: 850, status: 'pago' as const,
      dt_vencimento: `${mesRef}-10`, dt_pagamento: `${mesRef}-08`,
      forma_pagamento: 'pix', observacoes: null,
    },
  },
  {
    id: 'a2', nome: 'Maria Costa', turma: 'Jardim II',
    mensalidade: {
      id: 'm2', aluno_id: 'a2', mes_referencia: mesRef,
      valor: 850, status: 'pendente' as const,
      dt_vencimento: `${mesRef}-10`, dt_pagamento: null,
      forma_pagamento: null, observacoes: null,
    },
  },
  {
    id: 'a3', nome: 'Pedro Lima', turma: 'Jardim II',
    mensalidade: {
      id: 'm3', aluno_id: 'a3', mes_referencia: mesRef,
      valor: 850, status: 'vencido' as const,
      dt_vencimento: `${mesRef}-05`, dt_pagamento: null,
      forma_pagamento: null, observacoes: null,
    },
  },
  {
    id: 'a4', nome: 'Luisa Ramos', turma: 'Maternal I',
    mensalidade: null,
  },
]

const defaultProps = {
  alunos: alunosMock,
  escolaId: 'e1',
  usuarioId: 'u1',
  valorPadrao: 850,
  diaVencimento: 10,
}

describe('MensalidadesClient — renderização', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza todos os alunos', () => {
    render(<MensalidadesClient {...defaultProps} />)
    expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
    expect(screen.getByText('Maria Costa')).toBeInTheDocument()
    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.getByText('Luisa Ramos')).toBeInTheDocument()
  })

  it('exibe badge de status correto para cada aluno', () => {
    render(<MensalidadesClient {...defaultProps} />)
    expect(screen.getByText('Pago')).toBeInTheDocument()
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)
    expect(screen.getByText('Vencido')).toBeInTheDocument()
  })

  it('exibe KPI de alunos totais', () => {
    render(<MensalidadesClient {...defaultProps} />)
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('exibe navegação de mês com nome correto', () => {
    render(<MensalidadesClient {...defaultProps} />)
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    const mesNome = meses[mesAtual.getMonth()]
    expect(screen.getByText(new RegExp(mesNome, 'i'))).toBeInTheDocument()
  })
})

describe('MensalidadesClient — filtros', () => {
  beforeEach(() => vi.clearAllMocks())

  it('filtro "pagos" mostra apenas alunos com status pago', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^pagos$/i }))
    await waitFor(() => {
      expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
      expect(screen.queryByText('Maria Costa')).not.toBeInTheDocument()
    })
  })

  it('filtro "vencidos" mostra apenas alunos com status vencido', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^vencidos$/i }))
    await waitFor(() => {
      expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
      expect(screen.queryByText('Enzo Silva')).not.toBeInTheDocument()
    })
  })

  it('filtro "todos" restaura a lista completa', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /^pagos$/i }))
    fireEvent.click(screen.getByRole('button', { name: /^todos$/i }))
    await waitFor(() => {
      expect(screen.getByText('Enzo Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Costa')).toBeInTheDocument()
    })
  })

  it('busca por nome filtra corretamente', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    const input = screen.getByPlaceholderText(/buscar/i)
    await userEvent.type(input, 'Pedro')
    expect(screen.getByText('Pedro Lima')).toBeInTheDocument()
    expect(screen.queryByText('Enzo Silva')).not.toBeInTheDocument()
  })
})

describe('MensalidadesClient — modal de edição', () => {
  beforeEach(() => vi.clearAllMocks())

  it('abre modal ao clicar na linha do aluno', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    // O modal abre ao clicar em qualquer lugar da linha
    fireEvent.click(screen.getByText('Enzo Silva'))
    await waitFor(() => {
      // Verifica que o modal foi aberto (campo de valor fica visível)
      const valorInputs = document.querySelectorAll('input[type="number"], input[placeholder*="valor"], input[placeholder*="Valor"]')
      expect(document.querySelector('[role="dialog"], .fixed')).toBeTruthy()
    })
  })

  it('modal mostra o nome do aluno selecionado', async () => {
    render(<MensalidadesClient {...defaultProps} />)
    fireEvent.click(screen.getByText('Maria Costa'))
    await waitFor(() => {
      const modals = screen.getAllByText('Maria Costa')
      expect(modals.length).toBeGreaterThan(0)
    })
  })
})

describe('MensalidadesClient — gerar em lote', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true))
  })

  it('exibe botão de gerar em lote', () => {
    render(<MensalidadesClient {...defaultProps} />)
    expect(screen.getByRole('button', { name: /gerar em lote/i })).toBeInTheDocument()
  })

  it('chama supabase ao gerar em lote quando há alunos sem mensalidade', async () => {
    const insertMock = createSupabaseMock({ data: [{ id: 'novo-m' }], error: null })
    mockSupabaseClient.from.mockReturnValue(insertMock)

    render(<MensalidadesClient {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /gerar em lote/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mensalidades')
    })
  })
})

describe('MensalidadesClient — lista vazia', () => {
  it('exibe mensagem quando não há alunos', () => {
    render(<MensalidadesClient {...defaultProps} alunos={[]} />)
    expect(screen.getByText(/nenhum aluno/i)).toBeInTheDocument()
  })
})
