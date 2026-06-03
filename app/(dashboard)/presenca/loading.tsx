export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-32 bg-muted rounded-xl" />
        <div className="h-10 flex-1 bg-muted rounded-xl" />
        <div className="h-10 w-28 bg-muted rounded-xl" />
      </div>
      <div className="bg-white rounded-lg shadow-soft p-4">
        <div className="flex gap-4 mb-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-muted rounded-xl" />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
            <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded-xl" />
              <div className="h-9 w-24 bg-muted rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
