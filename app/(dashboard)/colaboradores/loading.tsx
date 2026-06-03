export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="h-10 flex-1 bg-muted rounded-xl" />
        <div className="h-10 w-36 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
            </div>
            <div className="flex gap-2 pt-1">
              <div className="h-8 flex-1 bg-muted rounded-lg" />
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
