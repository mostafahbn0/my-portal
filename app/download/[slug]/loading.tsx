export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 bg-slate-800 rounded-xl animate-pulse" />
        <div>
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-800 rounded animate-pulse mt-2" />
        </div>
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-slate-800 rounded-2xl h-40 animate-pulse mb-4" />
      ))}
    </div>
  );
}
