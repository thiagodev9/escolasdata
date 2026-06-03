export default function FrequenciaLoading() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-slate-200" />
        <div className="h-6 w-32 bg-slate-200 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 px-4 py-3 mb-5 flex items-center justify-between">
        <div className="w-5 h-5 rounded bg-slate-200" />
        <div className="h-5 w-36 bg-slate-200 rounded-full" />
        <div className="w-5 h-5 rounded bg-slate-200" />
      </div>
      {[1, 2].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded-full" />
              <div className="h-3 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-7 w-12 bg-slate-200 rounded-full" />
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-100 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, j) => (
              <div key={j} className="h-6 bg-slate-100 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
