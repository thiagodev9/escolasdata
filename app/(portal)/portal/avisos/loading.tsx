export default function AvisosLoading() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-slate-200" />
        <div className="h-6 w-44 bg-slate-200 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            {i === 1 && <div className="w-full h-40 bg-slate-200" />}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
                <div className="h-3 w-24 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 rounded-full" />
                <div className="h-3 w-4/5 bg-slate-100 rounded-full" />
                <div className="h-3 w-3/5 bg-slate-100 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
