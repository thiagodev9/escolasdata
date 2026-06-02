export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-80 bg-muted rounded mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 h-24" />
        ))}
      </div>
      <div className="bg-white rounded-lg shadow-soft">
        <div className="p-4 border-b border-border/50 flex gap-3">
          <div className="h-9 w-48 bg-muted rounded" />
          <div className="h-9 w-32 bg-muted rounded-full" />
          <div className="h-9 w-32 bg-muted rounded-full" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-border/30">
            <div className="h-4 flex-1 bg-muted rounded" />
            <div className="h-4 w-36 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-6 w-20 bg-muted rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
