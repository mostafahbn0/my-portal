export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="h-10 w-64 bg-slate-800 rounded-xl animate-pulse mb-4" />
      <div className="aspect-video bg-slate-800 rounded-2xl animate-pulse" />
      <div className="flex gap-2 mt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-28 bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
