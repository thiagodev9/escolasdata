export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-8" />
      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="lg:w-48 flex lg:flex-col gap-1 flex-row">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-muted rounded-md" />
          ))}
        </div>
        <div className="flex-1 bg-white rounded-lg shadow-soft p-6 h-64" />
      </div>
    </div>
  )
}
