interface AdSlotProps {
  position?: string
  type?: string
  height?: number
  label?: string
  id?: string
  className?: string
}

export default function AdSlot({ position = 'banner', label, className = '' }: AdSlotProps) {
  return (
    <div className={`w-full py-4 flex justify-center items-center overflow-hidden ${className}`}>
      <div className="w-full max-w-4xl h-24 md:h-28 bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs font-semibold gap-1">
        <span>مساحة إعلانية ({label || position})</span>
        <span className="text-[10px] text-slate-600">Leaderboard Ad 728x90 / Responsive Banner</span>
      </div>
    </div>
  )
}
