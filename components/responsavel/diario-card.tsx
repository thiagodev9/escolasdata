import { Palette } from 'lucide-react'

export function DiarioCard({ registro }: { registro: any }) {
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      {registro.foto_url && (
        <div className="aspect-video overflow-hidden bg-muted">
          <img src={registro.foto_url} alt={registro.titulo} className="w-full h-full object-cover" />
        </div>
      )}
      {!registro.foto_url && (
        <div className="aspect-video bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center">
          <Palette className="w-12 h-12 text-accent/40" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold bg-accent/10 text-accent px-2.5 py-0.5 rounded-full">Atividades</span>
          {registro.hora && <span className="text-xs text-muted-foreground">Ordens: {registro.hora.slice(0,5)}</span>}
        </div>
        <p className="font-bold text-foreground">{registro.titulo}</p>
        {registro.descricao && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{registro.descricao}</p>
        )}
      </div>
    </div>
  )
}
