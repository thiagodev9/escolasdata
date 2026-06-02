import { MessageSquareQuote } from 'lucide-react'

export function RecadoCard({ recado }: { recado: any }) {
  return (
    <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquareQuote className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-wide">Recado da Professora</span>
      </div>
      <p className="text-sm font-medium text-foreground italic leading-relaxed">
        &ldquo;{recado.descricao ?? recado.titulo}&rdquo;
      </p>
    </div>
  )
}
