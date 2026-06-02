import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renderiza o texto corretamente', () => {
    render(<Button>Entrar</Button>)
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('chama onClick ao ser clicado', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Clique</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('não chama onClick quando desabilitado', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Bloqueado</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('aplica variant default (bg-primary)', () => {
    const { container } = render(<Button>Padrão</Button>)
    expect(container.firstChild).toHaveClass('bg-primary')
  })

  it('aplica variant outline', () => {
    const { container } = render(<Button variant="outline">Outline</Button>)
    expect(container.firstChild).toHaveClass('border')
    expect(container.firstChild).not.toHaveClass('bg-primary')
  })

  it('aplica variant accent (laranja)', () => {
    const { container } = render(<Button variant="accent">Novo Aluno</Button>)
    expect(container.firstChild).toHaveClass('bg-accent')
  })

  it('aplica size sm com altura menor', () => {
    const { container } = render(<Button size="sm">Pequeno</Button>)
    expect(container.firstChild).toHaveClass('h-9')
  })

  it('tem altura mínima de 48px (acessibilidade mobile)', () => {
    const { container } = render(<Button>Acessível</Button>)
    expect(container.firstChild).toHaveClass('min-h-[48px]')
  })

  it('renderiza como filho quando asChild=true', () => {
    render(
      <Button asChild>
        <a href="/test">Link</a>
      </Button>
    )
    const link = screen.getByRole('link', { name: 'Link' })
    expect(link).toBeInTheDocument()
    expect(link.tagName).toBe('A')
  })

  it('aceita className customizado', () => {
    const { container } = render(<Button className="w-full">Full</Button>)
    expect(container.firstChild).toHaveClass('w-full')
  })
})
