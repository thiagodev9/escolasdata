export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-12 w-40 bg-muted rounded-md" />
      </div>
      <div className="flex gap-2 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-muted rounded-full" />
        ))}
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="break-inside-avoid bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-16 bg-muted rounded-full" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
