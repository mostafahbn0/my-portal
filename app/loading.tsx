export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Skeleton */}
      <div className="w-full h-[50vh] bg-slate-900 rounded-2xl animate-pulse mb-8" />

      {/* Slider Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-8">
          <div className="h-8 w-48 bg-slate-800 rounded-lg mb-4 animate-pulse" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="shrink-0 w-[180px]">
                <div className="aspect-[2/3] bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-4 w-3/4 bg-slate-800 rounded mt-2 animate-pulse" />
                <div className="h-3 w-1/2 bg-slate-800 rounded mt-1 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
