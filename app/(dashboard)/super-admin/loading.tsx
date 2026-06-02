export default function SuperAdminLoading() {
  return (
    <div className="p-6 lg:p-10">
      <div className="h-9 w-48 bg-muted rounded animate-pulse mb-2" />
      <div className="h-4 w-80 bg-muted rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />)}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse mb-3" />
      ))}
    </div>
  )
}
