export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 animate-pulse pb-24">
      <div className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="h-5 w-36 bg-muted rounded mb-1" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-soft p-5 h-32" />
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-soft h-24" />
          <div className="bg-white rounded-2xl shadow-soft h-24" />
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-5 h-40" />
      </div>
    </div>
  )
}