'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StudentCard } from './student-card'
import type { Aluno } from '@/lib/supabase/types'

interface AlunosListaProps {
  alunos: Aluno[]
}

export function AlunosLista({ alunos }: AlunosListaProps) {
  const [busca, setBusca] = useState('')

  const filtrados = alunos.filter((a) =>
    a.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total de Alunos</p>
          <p className="text-3xl font-bold text-foreground mt-1">{alunos.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-soft px-5 py-4 min-w-[120px]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pendente</p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {alunos.filter((a) => a.status === 'pendente').length}
          </p>
        </div>
        <div className="flex-1 bg-primary/5 rounded-lg shadow-soft px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-primary">Período de Matrículas</p>
            <p className="text-xs text-primary/70 mt-0.5">O período para 2024 está aberto.</p>
          </div>
          <div className="w-9 h-9 bg-primary/10 rounded-md flex items-center justify-center shrink-0">
            <Plus className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar aluno..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-10 h-10 min-h-0"
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-soft">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1.5fr_1fr_48px] gap-4 px-4 py-3 border-b border-border/50">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aluno</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Turma</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</p>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações</p>
        </div>

        <div className="px-4 divide-y divide-border/30">
          {filtrados.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground text-sm">
              {busca ? `Nenhum aluno encontrado para "${busca}"` : 'Nenhum aluno cadastrado ainda.'}
            </p>
          ) : (
            filtrados.map((aluno) => (
              <StudentCard key={aluno.id} aluno={aluno} />
            ))
          )}
        </div>

        {/* Pagination hint */}
        {filtrados.length > 0 && (
          <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Exibindo {filtrados.length} de {alunos.length} alunos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
