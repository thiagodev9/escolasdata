export default function RelatoriosLoading() {
  return (
    <div className="p-6 lg:p-10">
      <div className="h-9 w-40 bg-muted rounded animate-pulse mb-2" />
      <div className="h-4 w-64 bg-muted rounded animate-pulse mb-8" />
      <div className="h-32 bg-muted rounded animate-pulse mb-8" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
