export default function MensalidadesLoading() {
  return (
    <div className="max-w-md mx-auto px-4 pt-6 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-7 h-7 rounded-lg bg-slate-200" />
        <div className="h-6 w-36 bg-slate-200 rounded-full" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-5 space-y-2">
        <div className="h-3 w-28 bg-slate-200 rounded-full" />
        <div className="h-8 w-40 bg-slate-200 rounded-full" />
        <div className="h-3 w-52 bg-slate-100 rounded-full" />
      </div>
      {[1, 2].map(i => (
        <div key={i} className="mb-5">
          <div className="h-4 w-32 bg-slate-200 rounded-full mb-2 ml-1" />
          <div className="space-y-2">
            {[1, 2, 3].map(j => (
              <div key={j} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-200 rounded-full" />
                  <div className="h-3 w-32 bg-slate-100 rounded-full" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="h-4 w-20 bg-slate-200 rounded-full ml-auto" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
