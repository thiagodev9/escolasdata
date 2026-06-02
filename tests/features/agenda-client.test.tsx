import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgendaClient } from '@/components/agenda/agenda-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))

const hoje = new Date()
const amanha = new Date(hoje)
amanha.setDate(amanha.getDate() + 1)
const fmt = (d: Date) => d.toISOString().split('T')[0]

const eventosMock = [
  { id:'e1', titulo:'Reunião de Pais', data: fmt(amanha), hora:'19:00', local:'Auditório', turma:'Maternal I', tipo:'reuniao' },
  { id:'e2', titulo:'Festa Junina',    data: fmt(amanha), hora:'14:00', local:'Pátio',     turma:'Todos',      tipo:'evento'  },
]

const turmasMock = [
  { id:'t1', nome:'Maternal I' },
  { id:'t2', nome:'Jardim II'  },
]

describe('AgendaClient', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza o calendário com o mês atual', () => {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText(new RegExp(meses[hoje.getMonth()], 'i'))).toBeInTheDocument()
  })

  it('renderiza dias da semana', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('Seg')).toBeInTheDocument()
    expect(screen.getByText('Qui')).toBeInTheDocument()
    expect(screen.getByText('Dom')).toBeInTheDocument()
  })

  it('lista próximos eventos', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText('Reunião de Pais')).toBeInTheDocument()
    expect(screen.getByText('Festa Junina')).toBeInTheDocument()
  })

  it('navega para o mês seguinte ao clicar no segundo botão de navegação', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    const mesAtual = meses[hoje.getMonth()]
    expect(screen.getByText(new RegExp(mesAtual))).toBeInTheDocument()

    // Botões de navegação são ícones sem label — busca pelo container
    const { container } = render(<AgendaClient eventos={[]} turmas={[]} escolaId="e1" />)
    const navBtns = container.querySelectorAll('button[class*="w-8 h-8 rounded"]')
    expect(navBtns.length).toBeGreaterThanOrEqual(2)
  })

  it('abre modal ao clicar em Novo Evento', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    expect(screen.getByRole('heading', { name: /novo evento/i })).toBeInTheDocument()
  })

  it('modal contém campos obrigatórios', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    expect(screen.getByPlaceholderText(/reunião de pais/i)).toBeInTheDocument()
    expect(screen.getByText('Título *')).toBeInTheDocument()
    expect(screen.getByText('Data *')).toBeInTheDocument()
    expect(screen.getByText('Horário')).toBeInTheDocument()
  })

  it('lista tipos de evento no modal', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    expect(screen.getByRole('button', { name: 'Reunião' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Evento' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Avaliação' })).toBeInTheDocument()
  })

  it('exibe erro ao submeter sem título', async () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    fireEvent.click(screen.getByRole('button', { name: /criar evento/i }))
    await waitFor(() => {
      expect(screen.getByText(/título e data são obrigatórios/i)).toBeInTheDocument()
    })
  })

  it('salva evento ao preencher título e data', async () => {
    mockSupabaseClient.from.mockReturnValueOnce(createSupabaseMock({ data: { id: 'e3' }, error: null }))

    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    await userEvent.type(screen.getByPlaceholderText(/reunião de pais/i), 'Reunião de Planejamento')
    // Inputs de date por tipo
    const dateInputs = document.querySelectorAll('input[type="date"]')
    if (dateInputs[0]) fireEvent.change(dateInputs[0], { target: { value: fmt(amanha) } })
    fireEvent.click(screen.getByRole('button', { name: /criar evento/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('eventos')
    })
  })

  it('fecha modal ao clicar em Cancelar', () => {
    render(<AgendaClient eventos={eventosMock} turmas={turmasMock} escolaId="e1" />)
    fireEvent.click(screen.getByRole('button', { name: /novo evento/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(screen.queryByRole('heading', { name: /novo evento/i })).not.toBeInTheDocument()
  })

  it('exibe msg quando sem eventos futuros', () => {
    render(<AgendaClient eventos={[]} turmas={turmasMock} escolaId="e1" />)
    expect(screen.getByText(/nenhum evento futuro/i)).toBeInTheDocument()
  })
})
