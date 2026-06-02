'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Aluno, AlunoStatus } from '@/lib/supabase/types'

interface StudentCardProps {
  aluno: Aluno & { turma_nome?: string | null; responsavel_nome?: string | null; responsavel_tel?: string | null }
  onEdit?:   (aluno: StudentCardProps['aluno']) => void
  onDelete?: (aluno: StudentCardProps['aluno']) => void
}

const STATUS_MAP: Record<AlunoStatus, { label: string; variant: 'ativo' | 'pendente' | 'inativo' }> = {
  ativo:    { label: 'Ativo',    variant: 'ativo'    },
  pendente: { label: 'Pendente', variant: 'pendente' },
  inativo:  { label: 'Inativo',  variant: 'inativo'  },
}

export function StudentCard({ aluno, onEdit, onDelete }: StudentCardProps) {
  const [open, setOpen]   = useState(false)
  const menuRef           = useRef<HTMLDivElement>(null)
  const status            = STATUS_MAP[aluno.status] ?? STATUS_MAP.ativo
  const initials          = aluno.nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  return (
    <div className="grid grid-cols-[1fr_48px] md:grid-cols-[2fr_1fr_100px_48px] lg:grid-cols-[2fr_1fr_1.5fr_100px_48px] gap-4 items-center py-4 px-2 hover:bg-muted/30 transition-colors rounded -mx-2">

      {/* Aluno: avatar + nome */}
      <div className="flex items-center gap-3 min-w-0">
        <Link href={`/alunos/${aluno.id}`} className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/30 transition-all">
          {aluno.foto_url
            ? <img src={aluno.foto_url} alt={aluno.nome} className="w-full h-full object-cover rounded-full" />
            : <span className="text-sm font-bold text-primary">{initials}</span>
          }
        </Link>
        <div className="min-w-0">
          <Link href={`/alunos/${aluno.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block">
            {aluno.nome}
          </Link>
          <p className="text-xs text-muted-foreground">ID: #{aluno.id.slice(0, 4).toUpperCase()}</p>
        </div>
      </div>

      {/* Turma */}
      <div className="hidden md:block text-sm text-primary font-medium truncate">
        {aluno.turma_nome ?? '—'}
      </div>

      {/* Responsável */}
      <div className="hidden lg:block min-w-0">
        <p className="text-sm text-foreground truncate">{aluno.responsavel_nome ?? '—'}</p>
        <p className="text-xs text-muted-foreground truncate">{aluno.responsavel_tel ?? ''}</p>
      </div>

      {/* Status */}
      <div className="hidden md:flex">
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      {/* Menu */}
      <div ref={menuRef} className="relative justify-self-end">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
          aria-label="Ações"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-30 w-40 bg-white rounded-xl shadow-float border border-slate-100 py-1 animate-fade-in">
            <button
              onClick={() => { setOpen(false); onEdit?.(aluno) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
            <div className="h-px bg-slate-100 mx-2" />
            <button
              onClick={() => { setOpen(false); onDelete?.(aluno) }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
