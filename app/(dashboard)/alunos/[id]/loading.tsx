export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-9 w-9 bg-muted rounded-xl" />
        <div className="h-6 w-40 bg-muted rounded" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow-soft p-6 flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-muted" />
            <div className="h-5 w-36 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="bg-white rounded-lg shadow-soft p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-3 w-28 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-soft p-5 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-soft p-5 h-48" />
        </div>
      </div>
    </div>
  )
}
