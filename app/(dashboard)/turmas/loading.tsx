export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-40 bg-muted rounded mb-2" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
        <div className="h-12 w-36 bg-muted rounded-md" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 h-44" />
        ))}
      </div>
    </div>
  )
}
