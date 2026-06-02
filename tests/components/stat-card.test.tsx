import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/dashboard/stat-card'
import { Users } from 'lucide-react'

describe('StatCard', () => {
  it('exibe label e valor', () => {
    render(<StatCard label="Total de Alunos" value={156} icon={Users} />)
    expect(screen.getByText('Total de Alunos')).toBeInTheDocument()
    expect(screen.getByText('156')).toBeInTheDocument()
  })

  it('exibe variação quando fornecida', () => {
    render(<StatCard label="NPS" value="9.8" icon={Users} variacao="+2 este mês" />)
    expect(screen.getByText('+2 este mês')).toBeInTheDocument()
  })

  it('exibe badge "Atenção" quando status=atencao', () => {
    render(<StatCard label="Inadimplência" value="4.2%" icon={Users} status="atencao" />)
    expect(screen.getByText('Atenção')).toBeInTheDocument()
  })

  it('exibe badge "Excelente" quando status=excelente', () => {
    render(<StatCard label="NPS" value="9.8" icon={Users} status="excelente" />)
    expect(screen.getByText('Excelente')).toBeInTheDocument()
  })

  it('aplica cor vermelha no valor quando status=atencao', () => {
    const { container } = render(<StatCard label="X" value="4%" icon={Users} status="atencao" />)
    const valor = container.querySelector('.text-2xl')
    expect(valor).toHaveClass('text-red-500')
  })

  it('tem card branco com sombra soft', () => {
    const { container } = render(<StatCard label="X" value={0} icon={Users} />)
    expect(container.firstChild).toHaveClass('bg-white', 'shadow-soft')
  })
})
