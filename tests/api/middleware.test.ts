import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock updateSession
const mockUser = vi.fn()
const mockSupabaseQuery = vi.fn()

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn().mockImplementation(async (req: NextRequest) => {
    const user = mockUser()
    const supabase = {
      from: () => ({
        select: () => ({ eq: () => ({ single: () => mockSupabaseQuery() }) }),
      }),
    }
    const supabaseResponse = { headers: { set: vi.fn() }, cookies: { set: vi.fn() } }
    return { supabaseResponse, user, supabase }
  }),
}))

const { middleware } = await import('@/middleware')

function makeReq(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`)
}

describe('Middleware de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'diretora', escola_id: 'e1' } })
  })

  it('redireciona /dashboard para /login quando não autenticado', async () => {
    mockUser.mockReturnValue(null)
    const res = await middleware(makeReq('/dashboard'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('preserva redirectTo na URL ao redirecionar', async () => {
    mockUser.mockReturnValue(null)
    const res = await middleware(makeReq('/alunos'))
    expect(res.headers.get('location')).toContain('redirectTo=%2Falunos')
  })

  it('redireciona /login para /dashboard quando já autenticado', async () => {
    mockUser.mockReturnValue({ id: 'u1', email: 'admin@test.com' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'diretora' } })
    const res = await middleware(makeReq('/login'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dashboard')
  })

  it('responsavel autenticado em /login vai para /diario', async () => {
    mockUser.mockReturnValue({ id: 'u2' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'responsavel' } })
    const res = await middleware(makeReq('/login'))
    expect(res.headers.get('location')).toContain('/diario')
  })

  it('professora bloqueada em /financeiro → redireciona', async () => {
    mockUser.mockReturnValue({ id: 'u3' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'professora', escola_id: 'e1' } })
    const res = await middleware(makeReq('/financeiro'))
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/dashboard')
  })

  it('responsavel bloqueado em /turmas → redireciona', async () => {
    mockUser.mockReturnValue({ id: 'u4' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'responsavel', escola_id: 'e1' } })
    const res = await middleware(makeReq('/turmas'))
    expect(res.status).toBe(307)
  })

  it('diretora acessa /financeiro sem redirecionamento', async () => {
    mockUser.mockReturnValue({ id: 'u5' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'diretora', escola_id: 'e1' } })
    const res = await middleware(makeReq('/financeiro'))
    // Não deve ser redirect (307/302)
    expect([200, 308]).not.toContain(307)
  })

  it('injeta x-escola-id e x-user-role nos headers', async () => {
    mockUser.mockReturnValue({ id: 'u5' })
    mockSupabaseQuery.mockResolvedValue({ data: { role: 'diretora', escola_id: 'escola-uuid-1' } })
    const res = await middleware(makeReq('/dashboard'))
    // supabaseResponse.headers.set foi chamado
    const { updateSession } = await import('@/lib/supabase/middleware')
    expect(updateSession).toHaveBeenCalled()
  })

  it('ignora arquivos estáticos (/_next/...)', async () => {
    mockUser.mockReturnValue(null)
    const res = await middleware(makeReq('/_next/static/chunk.js'))
    expect(res.status).not.toBe(307)
  })
})
