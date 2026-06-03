import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardapioClient } from '@/components/cardapio/cardapio-client'
import { mockSupabaseClient, createSupabaseMock } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }), useTransition: () => [false, (fn: any) => fn()] }))

function getMondayStr(): string {
  const d = new Date()
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  return d.toISOString().split('T')[0]
}

const semana = getMondayStr()

const itemsMock = [
  { id: 'i1', escola_id: 'e1', semana_inicio: semana, dia_semana: 1, refeicao: 'cafe_manha', descricao: 'Leite e biscoito' },
  { id: 'i2', escola_id: 'e1', semana_inicio: semana, dia_semana: 1, refeicao: 'almoco', descricao: 'Arroz, feijão e frango' },
  { id: 'i3', escola_id: 'e1', semana_inicio: semana, dia_semana: 2, refeicao: 'cafe_manha', descricao: 'Iogurte com fruta' },
  { id: 'i4', escola_id: 'e1', semana_inicio: semana, dia_semana: 3, refeicao: 'lanche_tarde', descricao: 'Bolo de cenoura' },
]

describe('CardapioClient — renderização', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza o grid com cabeçalho de refeições', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    // O componente exibe o label "Refeição" no cabeçalho do grid
    expect(screen.getByText(/refeição/i)).toBeInTheDocument()
  })

  it('exibe os dias da semana no grid', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    expect(screen.getByText('Segunda')).toBeInTheDocument()
    expect(screen.getByText('Terça')).toBeInTheDocument()
    expect(screen.getByText('Quarta')).toBeInTheDocument()
    expect(screen.getByText('Quinta')).toBeInTheDocument()
    expect(screen.getByText('Sexta')).toBeInTheDocument()
  })

  it('exibe os tipos de refeição', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    expect(screen.getByText('Café da manhã')).toBeInTheDocument()
    expect(screen.getByText('Almoço')).toBeInTheDocument()
    expect(screen.getByText('Lanche da tarde')).toBeInTheDocument()
  })

  it('exibe as descrições dos itens cadastrados', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    expect(screen.getByText('Leite e biscoito')).toBeInTheDocument()
    expect(screen.getByText('Arroz, feijão e frango')).toBeInTheDocument()
    expect(screen.getByText('Iogurte com fruta')).toBeInTheDocument()
    expect(screen.getByText('Bolo de cenoura')).toBeInTheDocument()
  })

  it('exibe intervalo de datas da semana atual', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    // O header deve conter separador de datas "–"
    const headers = document.querySelectorAll('*')
    const hasDateRange = Array.from(headers).some(el => el.textContent?.includes('–'))
    expect(hasDateRange).toBe(true)
  })
})

describe('CardapioClient — navegação de semana', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe botões de navegação anterior e próximo', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    const btns = screen.getAllByRole('button')
    const navBtns = btns.filter(b => {
      const svg = b.querySelector('svg')
      return svg !== null && !b.textContent?.trim()
    })
    expect(navBtns.length).toBeGreaterThanOrEqual(2)
  })
})

describe('CardapioClient — edição inline', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exibe botão de editar em célula com conteúdo', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    const pencils = document.querySelectorAll('[data-testid="edit-cell"], button svg')
    expect(pencils.length).toBeGreaterThan(0)
  })

  it('exibe botão "Copiar semana anterior"', () => {
    render(<CardapioClient items={itemsMock} escolaId="e1" />)
    expect(screen.getByRole('button', { name: /copiar semana anterior/i })).toBeInTheDocument()
  })
})

describe('CardapioClient — sem itens', () => {
  it('renderiza grid vazio sem erros', () => {
    render(<CardapioClient items={[]} escolaId="e1" />)
    expect(screen.getByText('Segunda')).toBeInTheDocument()
    expect(screen.getByText('Café da manhã')).toBeInTheDocument()
  })
})
