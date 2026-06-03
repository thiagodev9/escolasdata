export default function PortalLoading() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-slate-200 shrink-0" />
        <div className="space-y-2">
          <div className="h-3 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-28 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="space-y-3 mb-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 w-36 bg-slate-200 rounded-full" />
              <div className="h-3 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-6 w-24 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-100 p-4 space-y-2 ${i === 3 ? 'col-span-2' : ''}`}>
            <div className="w-6 h-6 rounded-lg bg-slate-200" />
            <div className="h-4 w-24 bg-slate-200 rounded-full" />
            <div className="h-3 w-20 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
