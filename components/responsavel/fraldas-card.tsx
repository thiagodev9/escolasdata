import { Baby } from 'lucide-react'

export function FraldasCard({ fraldas }: { fraldas: any[] }) {
  return (
    <div className="bg-white rounded-xl shadow-soft p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
          <Baby className="w-4 h-4 text-pink-600" />
        </div>
        <span className="font-bold text-foreground">Fraldas</span>
        <span className="ml-auto text-xs bg-pink-50 text-pink-600 font-semibold px-2 py-0.5 rounded-full">
          {fraldas.length}x hoje
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {fraldas.map((f, i) => (
          <div key={f.id ?? i} className="bg-pink-50 rounded-lg px-3 py-2 text-center min-w-[80px]">
            <p className="text-xs text-muted-foreground">{f.hora?.slice(0,5) ?? '--:--'}</p>
            <p className="text-xs font-semibold text-pink-700 mt-0.5">
              {f.titulo?.toLowerCase().includes('xixi') ? '🟡 Xixi' :
               f.titulo?.toLowerCase().includes('cocô') ? '🟤 Cocô' : f.titulo}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
