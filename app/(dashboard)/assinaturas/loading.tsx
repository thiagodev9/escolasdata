export default function Loading() {
  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto animate-pulse">
      <div className="h-8 w-44 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-soft p-6 h-48" />
        ))}
      </div>
      <div className="bg-white rounded-2xl shadow-soft p-6 h-32" />
    </div>
  )
}
