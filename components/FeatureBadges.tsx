import { ShieldCheck, Zap, Subtitles, Film } from 'lucide-react';

export default function FeatureBadges() {
  const features = [
    { icon: Film, title: 'جودة 4K فائقة', desc: 'مشاهدة وتحميل بأعلى جودة نقية' },
    { icon: Subtitles, title: 'ترجمة فورية معتمدة', desc: 'ترجمة عربية دقيقة لكل الأعمال' },
    { icon: Zap, title: 'سيرفرات VIP فائقة السرعة', desc: 'بث مباشر صاروخي بدون تقطيع' },
    { icon: ShieldCheck, title: 'آمن ومحدث يومياً', desc: 'إضافة أحدث الإصدارات فور صدورها' },
  ];

  return (
    <section className="my-10 grid grid-cols-2 md:grid-cols-4 gap-4">
      {features.map((f, i) => {
        const Icon = f.icon;
        return (
          <div key={i} className="bg-[#121318]/80 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5 hover:border-red-600/30 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-red-600/10 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-600/20 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white text-xs md:text-sm font-black">{f.title}</h4>
              <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{f.desc}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
