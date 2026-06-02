import { Utensils, Coffee } from 'lucide-react'

export function RefeicaoCard({ refeicoes }: { refeicoes: any[] }) {
  const almoco = refeicoes.find(r => r.hora && r.hora < '15:00') ?? refeicoes[0]
  const lanche = refeicoes.find(r => r.hora && r.hora >= '15:00')

  return (
    <div className="bg-white rounded-xl shadow-soft p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-bold text-foreground">Refeições</span>
        </div>
        {almoco?.hora && (
          <span className="text-xs text-muted-foreground font-medium">Última: {almoco.hora.slice(0,5)}</span>
        )}
      </div>

      <div className="space-y-3">
        {almoco && (
          <div className="bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Utensils className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-semibold text-amber-700">Almoço{almoco.hora ? `: ${almoco.hora.slice(0,5)}` : ''}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{almoco.titulo}</p>
            {almoco.descricao && <p className="text-xs text-muted-foreground mt-0.5">{almoco.descricao}</p>}
          </div>
        )}
        {lanche && (
          <div className="bg-orange-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Coffee className="w-3.5 h-3.5 text-orange-600" />
              <span className="text-xs font-semibold text-orange-700">Lanche{lanche.hora ? `: ${lanche.hora.slice(0,5)}` : ''}</span>
            </div>
            <p className="text-sm font-semibold text-foreground">{lanche.titulo}</p>
            {lanche.descricao && <p className="text-xs text-muted-foreground mt-0.5">{lanche.descricao}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
