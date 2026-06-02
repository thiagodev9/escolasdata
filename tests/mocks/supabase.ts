import { vi } from 'vitest'

// Builder de mock fluente para o Supabase
export function createSupabaseMock(resolveWith: { data?: any; error?: any; count?: number } = {}) {
  const chain: any = {
    data:  resolveWith.data  ?? null,
    error: resolveWith.error ?? null,
    count: resolveWith.count ?? 0,
  }
  const builder = new Proxy(chain, {
    get(target, prop) {
      if (prop in target) return target[prop]
      // Métodos que retornam a própria chain
      const passthrough = ['select','insert','update','delete','upsert','eq','neq',
                           'in','order','limit','single','maybeSingle','match','filter',
                           'gt','gte','lt','lte','is','not','or','and','contains']
      if (passthrough.includes(String(prop))) return () => builder
      return vi.fn()
    },
  })
  return builder
}

export const mockSupabaseClient = {
  auth: {
    getUser:              vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'admin@starlight.com' } }, error: null }),
    signInWithPassword:   vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' }, session: {} }, error: null }),
    signOut:              vi.fn().mockResolvedValue({ error: null }),
    admin: {
      createUser:  vi.fn().mockResolvedValue({ data: { user: { id: 'new-user-1' } }, error: null }),
      listUsers:   vi.fn().mockResolvedValue({ data: { users: [] }, error: null }),
      updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  },
  from: vi.fn().mockReturnValue(createSupabaseMock()),
}

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabaseClient,
}))

vi.mock('@/lib/supabase/admin', () => ({
  createClient: () => mockSupabaseClient,
}))
