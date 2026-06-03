export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 h-24" />
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-10 flex-1 bg-muted rounded-xl" />
        <div className="h-10 w-36 bg-muted rounded-xl" />
      </div>
      <div className="bg-white rounded-lg shadow-soft p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
            <div className="w-9 h-9 rounded-xl bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
            <div className="hidden md:block h-4 w-20 bg-muted rounded" />
            <div className="h-5 w-24 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
