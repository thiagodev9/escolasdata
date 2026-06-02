import { Moon } from 'lucide-react'

function duracaoSono(inicio: string, fim?: string): string {
  if (!fim) return '—'
  const [h1, m1] = inicio.split(':').map(Number)
  const [h2, m2] = fim.split(':').map(Number)
  const mins = (h2 * 60 + m2) - (h1 * 60 + m1)
  if (mins <= 0) return '—'
  const h = Math.floor(mins / 60), m = mins % 60
  return `${h}h${m > 0 ? ` ${m}min` : ''}`
}

export function SonoCard({ sonos }: { sonos: any[] }) {
  const sono = sonos[0]
  const horaFim = sono.descricao?.match(/até (\d{2}:\d{2})/)?.[1]
  const duracao = sono.hora ? duracaoSono(sono.hora, horaFim) : '—'
  const humor = sono.descricao?.includes('Tranquilo') ? 'Tranquilo 😌' : sono.descricao?.includes('Agitado') ? 'Agitado 😅' : 'Normal'

  return (
    <div className="bg-white rounded-xl shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
          <Moon className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="font-bold text-foreground">Sono</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-lg font-bold text-indigo-600">{duracao}</span>
          <span className="text-xs text-muted-foreground bg-indigo-50 px-2 py-0.5 rounded-full">{humor}</span>
        </div>
      </div>
      <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Dormiu</p>
          <p className="font-bold text-indigo-700">{sono.hora?.slice(0,5) ?? '—'}</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="h-0.5 flex-1 bg-indigo-200 rounded" />
          <Moon className="w-4 h-4 text-indigo-400 mx-2" />
          <div className="h-0.5 flex-1 bg-indigo-200 rounded" />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Acordou</p>
          <p className="font-bold text-indigo-700">{horaFim ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}
