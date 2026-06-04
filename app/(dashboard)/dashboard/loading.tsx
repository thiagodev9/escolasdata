export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-7 w-52 bg-muted rounded mb-1" />
      <div className="h-4 w-64 bg-muted rounded mb-8" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-soft p-5 h-28" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-soft p-5 h-64" />
        <div className="bg-white rounded-xl shadow-soft p-5 h-64" />
      </div>
    </div>
  )
}
