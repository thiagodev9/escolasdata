import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ActivityCard } from '@/components/dashboard/activity-card'

describe('ActivityCard', () => {
  it('renderiza título da atividade', () => {
    render(<ActivityCard tipo="atividade" titulo="Pintura com guache" />)
    expect(screen.getByText('Pintura com guache')).toBeInTheDocument()
  })

  it('exibe label do tipo correto', () => {
    render(<ActivityCard tipo="refeicao" titulo="Almoço" />)
    expect(screen.getByText('Refeição')).toBeInTheDocument()
  })

  it('exibe label Sono', () => {
    render(<ActivityCard tipo="sono" titulo="Dormiu 1h30" />)
    expect(screen.getByText('Sono')).toBeInTheDocument()
  })

  it('exibe label Fraldas', () => {
    render(<ActivityCard tipo="fralda" titulo="Troca - Xixi" />)
    expect(screen.getByText('Fraldas')).toBeInTheDocument()
  })

  it('exibe descrição quando fornecida', () => {
    render(<ActivityCard tipo="atividade" titulo="Arte" descricao="Explorou cores primárias" />)
    expect(screen.getByText('Explorou cores primárias')).toBeInTheDocument()
  })

  it('exibe horário quando fornecido', () => {
    render(<ActivityCard tipo="refeicao" titulo="Almoço" hora="12:00" />)
    expect(screen.getByText('12:00')).toBeInTheDocument()
  })

  it('não exibe descrição ausente', () => {
    const { container } = render(<ActivityCard tipo="sono" titulo="Sono" />)
    expect(container.querySelector('p.text-sm.text-muted-foreground')).toBeNull()
  })

  it('tipo pedagogico usa ícone de livro (cor primary)', () => {
    const { container } = render(<ActivityCard tipo="pedagogico" titulo="Leitura" />)
    const iconWrapper = container.querySelector('.bg-primary\\/5')
    expect(iconWrapper).toBeInTheDocument()
  })
})
