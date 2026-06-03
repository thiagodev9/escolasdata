export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 bg-muted rounded-xl" />
        <div className="h-6 w-48 bg-muted rounded" />
        <div className="h-9 w-9 bg-muted rounded-xl" />
        <div className="flex-1" />
        <div className="h-9 w-36 bg-muted rounded-xl" />
      </div>
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="grid grid-cols-6 border-b border-border/30">
          <div className="p-3 bg-muted/30" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3 border-l border-border/30">
              <div className="h-4 w-16 bg-muted rounded mx-auto" />
            </div>
          ))}
        </div>
        {[...Array(3)].map((_, row) => (
          <div key={row} className="grid grid-cols-6 border-b border-border/30 last:border-0">
            <div className="p-3 bg-muted/10">
              <div className="h-4 w-20 bg-muted rounded" />
            </div>
            {[...Array(5)].map((_, col) => (
              <div key={col} className="p-3 border-l border-border/30 min-h-[80px]">
                <div className="h-3 w-full bg-muted rounded mb-1" />
                <div className="h-3 w-4/5 bg-muted rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
