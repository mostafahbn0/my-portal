export default function AdSlot({ height = 120, label = 'مساحة إعلانية', id }: { height?: number; label?: string; id?: string }) {
  return (
    <div id={id} className="w-full my-6 bg-slate-900/50 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 text-xs select-none" style={{ minHeight: height, height }} aria-label={label}>
      {label}
    </div>
  );
}
