export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="max-w-2xl space-y-4">
        <div className="bg-white rounded-lg shadow-soft p-6 space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="h-32 bg-muted/30 rounded-xl border-2 border-dashed border-muted" />
          <div className="h-10 w-full bg-muted rounded-xl" />
        </div>
        <div className="bg-white rounded-lg shadow-soft p-6 space-y-3">
          <div className="h-5 w-36 bg-muted rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-muted shrink-0" />
              <div className="h-3 w-full bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
