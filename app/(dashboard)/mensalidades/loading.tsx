export default function Loading() {
  return (
    <div className="p-6 lg:p-10 animate-pulse">
      <div className="h-8 w-48 bg-muted rounded mb-2" />
      <div className="h-4 w-72 bg-muted rounded mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-soft p-5 h-24" />
        ))}
      </div>
      <div className="flex gap-3 mb-4">
        <div className="h-10 w-10 bg-muted rounded-xl" />
        <div className="h-10 w-32 bg-muted rounded-xl" />
        <div className="h-10 w-10 bg-muted rounded-xl" />
        <div className="flex-1" />
        <div className="h-10 w-32 bg-muted rounded-xl" />
        <div className="h-10 w-36 bg-muted rounded-xl" />
      </div>
      <div className="bg-white rounded-lg shadow-soft p-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border/30 last:border-0">
            <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
            <div className="hidden md:block h-4 w-24 bg-muted rounded" />
            <div className="hidden lg:block h-4 w-20 bg-muted rounded" />
            <div className="h-6 w-16 bg-muted rounded-full" />
            <div className="h-8 w-8 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
