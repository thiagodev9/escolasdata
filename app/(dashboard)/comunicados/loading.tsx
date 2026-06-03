export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-soft p-5 space-y-3">
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-24 bg-muted rounded-xl" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-muted rounded-xl" />
              <div className="h-10 w-28 bg-muted rounded-xl" />
            </div>
            <div className="h-10 w-full bg-muted rounded-xl" />
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-4/5 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
