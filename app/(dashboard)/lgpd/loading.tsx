export default function LgpdLoading() {
  return (
    <div className="p-6 lg:p-10">
      <div className="h-9 w-24 bg-muted rounded animate-pulse mb-2" />
      <div className="h-4 w-96 bg-muted rounded animate-pulse mb-8" />
      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        <div className="h-16 bg-muted rounded-lg animate-pulse" />
        <div className="h-16 bg-muted rounded-lg animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-lg animate-pulse mb-2" />
      ))}
    </div>
  )
}
