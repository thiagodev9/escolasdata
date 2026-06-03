export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-40 bg-muted rounded-xl" />
        <div className="h-10 w-40 bg-muted rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
            <div className="h-20 bg-muted rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
