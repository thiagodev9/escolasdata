import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '@/components/auth/login-form'
import { mockSupabaseClient } from '../mocks/supabase'

vi.mock('@/lib/supabase/client', () => ({ createClient: () => mockSupabaseClient }))

describe('LoginForm', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renderiza campos de email e senha', () => {
    render(<LoginForm />)
    expect(screen.getByPlaceholderText('nome@escola.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renderiza botão Entrar', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('renderiza link Solicitar Demonstração', () => {
    render(<LoginForm />)
    expect(screen.getByText(/solicitar demonstração/i)).toBeInTheDocument()
  })

  it('alterna visibilidade da senha', async () => {
    render(<LoginForm />)
    const senhaInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement
    expect(senhaInput.type).toBe('password')

    const toggleBtn = screen.getByRole('button', { name: /mostrar senha/i })
    fireEvent.click(toggleBtn)
    expect(senhaInput.type).toBe('text')

    fireEvent.click(screen.getByRole('button', { name: /ocultar senha/i }))
    expect(senhaInput.type).toBe('password')
  })

  it('exibe erro quando credenciais são inválidas', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })

    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'wrong@test.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText(/e-mail ou senha inválidos/i)).toBeInTheDocument()
    })
  })

  it('chama signInWithPassword com email e senha corretos', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { id: 'u1' }, session: {} },
      error: null,
    })

    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@starlight.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'EduNest123')
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@starlight.com',
        password: 'EduNest123',
      })
    })
  })

  it('desabilita botão durante o login', async () => {
    mockSupabaseClient.auth.signInWithPassword.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(resolve, 500))
    )

    render(<LoginForm />)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'admin@starlight.com')
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'password')
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }))

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
  })

  it('checkbox "Lembrar de mim" funciona', async () => {
    render(<LoginForm />)
    const checkbox = screen.getByRole('checkbox', { name: /lembrar/i })
    expect(checkbox).not.toBeChecked()
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })
})
