import { Utensils, Moon, Baby, Palette, BookOpen, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type ActivityType = 'refeicao' | 'sono' | 'fralda' | 'atividade' | 'pedagogico'

interface ActivityCardProps {
  tipo: ActivityType
  titulo: string
  descricao?: string
  hora?: string
  className?: string
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: LucideIcon; color: string; bg: string; label: string }> = {
  refeicao: { icon: Utensils, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Refeição' },
  sono: { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Sono' },
  fralda: { icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Fraldas' },
  atividade: { icon: Palette, color: 'text-accent', bg: 'bg-orange-50', label: 'Atividade' },
  pedagogico: { icon: BookOpen, color: 'text-primary', bg: 'bg-primary/5', label: 'Pedagógico' },
}

export function ActivityCard({ tipo, titulo, descricao, hora, className }: ActivityCardProps) {
  const config = ACTIVITY_CONFIG[tipo]
  const Icon = config.icon

  return (
    <div className={cn('bg-white rounded-lg shadow-soft p-4 flex gap-3', className)}>
      <div className={cn('w-10 h-10 rounded-md flex items-center justify-center shrink-0', config.bg)}>
        <Icon className={cn('w-5 h-5', config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{config.label}</p>
            <p className="font-semibold text-sm text-foreground mt-0.5">{titulo}</p>
          </div>
          {hora && <span className="text-xs text-muted-foreground shrink-0">{hora}</span>}
        </div>
        {descricao && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{descricao}</p>}
      </div>
    </div>
  )
}
