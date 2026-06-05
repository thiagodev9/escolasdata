export default function Loading() {
  return (
    <div className="p-6 max-w-3xl mx-auto animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-56 bg-muted rounded mb-6" />
      <div className="h-10 w-36 bg-primary/20 rounded-lg mb-6" />
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft p-4 border-l-4 border-muted">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-3/4 bg-muted rounded" />
              </div>
              <div className="h-6 w-16 bg-muted rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
