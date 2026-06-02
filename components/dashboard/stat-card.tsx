import { cn } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  variacao?: string
  variacaoLabel?: string
  status?: 'normal' | 'atencao' | 'excelente'
  iconColor?: string
  className?: string
}

const STATUS_VALUE_COLORS = {
  normal:    'text-slate-800',
  atencao:   'text-red-500',
  excelente: 'text-emerald-600',
}

const STATUS_BADGE = {
  normal:    null,
  atencao:   { label: 'Atenção',   cls: 'bg-red-50 text-red-500' },
  excelente: { label: 'Excelente', cls: 'bg-emerald-50 text-emerald-600' },
}

export function StatCard({
  label, value, icon: Icon, variacao, variacaoLabel,
  status = 'normal', iconColor = 'kpi-icon-blue', className,
}: StatCardProps) {
  const badge = STATUS_BADGE[status]

  return (
    <div className={cn(
      'bg-white rounded-2xl shadow-soft border border-slate-100/80 p-5',
      'flex items-center gap-4 hover:shadow-float transition-shadow',
      className
    )}>
      {/* Ícone colorido */}
      <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', iconColor)}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={cn('text-2xl font-black', STATUS_VALUE_COLORS[status])}>{value}</p>

        {variacao && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">{variacao}</span>
          </div>
        )}
        {variacaoLabel && (
          <p className="text-xs text-slate-400 mt-0.5">{variacaoLabel}</p>
        )}
        {badge && (
          <span className={cn('inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1', badge.cls)}>
            {badge.label}
          </span>
        )}
      </div>
    </div>
  )
}
