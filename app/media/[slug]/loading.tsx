export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row-reverse gap-8">
        <div className="lg:w-1/4 shrink-0">
          <div className="aspect-[2/3] bg-slate-800 rounded-2xl animate-pulse" />
          <div className="mt-4 bg-slate-800 rounded-xl h-32 animate-pulse" />
        </div>
        <div className="lg:w-3/4 space-y-4">
          <div className="h-6 w-20 bg-slate-800 rounded animate-pulse" />
          <div className="h-12 w-3/4 bg-slate-800 rounded-xl animate-pulse" />
          <div className="flex gap-4">
            <div className="h-14 w-40 bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-14 w-40 bg-slate-800 rounded-xl animate-pulse" />
          </div>
          <div className="h-40 bg-slate-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
