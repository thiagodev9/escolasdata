import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn() — class merger', () => {
  it('retorna string vazia sem argumentos', () => {
    expect(cn()).toBe('')
  })

  it('concatena classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', false, null, undefined, '')).toBe('foo')
  })

  it('resolve conflitos do Tailwind (último vence)', () => {
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('bg-white', 'bg-primary')).toBe('bg-primary')
  })

  it('mantém classes não-conflitantes', () => {
    expect(cn('flex', 'items-center', 'gap-4')).toBe('flex items-center gap-4')
  })

  it('aceita objetos condicionais', () => {
    expect(cn({ 'font-bold': true, 'text-red-500': false })).toBe('font-bold')
  })

  it('aceita arrays', () => {
    expect(cn(['flex', 'gap-2'], 'p-4')).toBe('flex gap-2 p-4')
  })

  it('combina condicional com string', () => {
    const isActive = true
    expect(cn('base-class', isActive && 'active-class')).toBe('base-class active-class')
  })
})
