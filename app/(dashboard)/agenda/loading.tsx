export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-36 bg-muted rounded mb-2" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-12 w-40 bg-muted rounded-md" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-soft p-6">
          <div className="flex justify-between mb-6">
            <div className="h-6 w-40 bg-muted rounded" />
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-muted rounded" />
              <div className="w-8 h-8 bg-muted rounded" />
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-md" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-soft p-4 h-28" />
          ))}
        </div>
      </div>
    </div>
  )
}
