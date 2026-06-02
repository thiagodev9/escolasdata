export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-64 bg-muted rounded-md mb-2" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      {/* Cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 h-28" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft h-64" />
        <div className="bg-white rounded-lg shadow-soft h-64" />
      </div>
    </div>
  )
}
