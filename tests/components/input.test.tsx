import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/input'

describe('Input', () => {
  it('renderiza com placeholder', () => {
    render(<Input placeholder="nome@escola.com" />)
    expect(screen.getByPlaceholderText('nome@escola.com')).toBeInTheDocument()
  })

  it('chama onChange ao digitar', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'teste' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('tem altura de 48px (mobile ergonomics)', () => {
    const { container } = render(<Input />)
    expect(container.firstChild).toHaveClass('h-12')
  })

  it('tem borda primária ao focar', () => {
    const { container } = render(<Input />)
    expect(container.firstChild).toHaveClass('focus:border-primary')
  })

  it('type password oculta conteúdo', () => {
    render(<Input type="password" defaultValue="123456" />)
    const input = screen.getByDisplayValue('123456') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('aceita className customizado', () => {
    const { container } = render(<Input className="pl-10" />)
    expect(container.firstChild).toHaveClass('pl-10')
  })

  it('desabilitado não aceita input', () => {
    render(<Input disabled placeholder="bloqueado" />)
    expect(screen.getByPlaceholderText('bloqueado')).toBeDisabled()
  })
})
