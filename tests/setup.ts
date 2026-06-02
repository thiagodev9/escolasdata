import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpa DOM após cada teste
afterEach(() => cleanup())

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter:     () => ({ push: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname:   () => '/',
  useSearchParams: () => ({ get: vi.fn(() => null) }),
  redirect:      vi.fn(),
}))

// Mock Next.js headers (server-side)
vi.mock('next/headers', () => ({
  cookies: () => ({ getAll: () => [], set: vi.fn() }),
}))

// Mock variáveis de ambiente
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL',      'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY',     'test-service-key')
vi.stubEnv('ASAAS_API_KEY',                 '$aact_test_key')
vi.stubEnv('ASAAS_BASE_URL',                'https://sandbox.asaas.com/api/v3')
