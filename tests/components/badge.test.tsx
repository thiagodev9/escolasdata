import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renderiza o texto', () => {
    render(<Badge>Ativo</Badge>)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('variant ativo — verde', () => {
    const { container } = render(<Badge variant="ativo">Ativo</Badge>)
    expect(container.firstChild).toHaveClass('bg-emerald-100', 'text-emerald-700')
  })

  it('variant pendente — âmbar', () => {
    const { container } = render(<Badge variant="pendente">Pendente</Badge>)
    expect(container.firstChild).toHaveClass('bg-amber-100', 'text-amber-700')
  })

  it('variant inativo — cinza', () => {
    const { container } = render(<Badge variant="inativo">Inativo</Badge>)
    expect(container.firstChild).toHaveClass('bg-slate-100', 'text-slate-500')
  })

  it('tem border-radius pill (rounded-full)', () => {
    const { container } = render(<Badge>Status</Badge>)
    expect(container.firstChild).toHaveClass('rounded-full')
  })
})
