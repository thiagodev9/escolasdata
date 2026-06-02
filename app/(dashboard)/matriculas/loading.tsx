export default function MatriculasLoading() {
  return (
    <div className="p-6 lg:p-10">
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
      <div className="h-4 w-72 bg-muted rounded animate-pulse mb-8" />
      <div className="h-12 w-full bg-muted rounded animate-pulse mb-5" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse mb-3" />
      ))}
    </div>
  )
}
