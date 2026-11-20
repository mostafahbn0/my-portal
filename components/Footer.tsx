import Link from 'next/link';
import { Film, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/5 bg-[#060608] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-right">
            <Link href="/" className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
              سينما بلاس VIP
            </Link>
            <p className="text-xs text-gray-500 max-w-md">
              المنصة الترفيهية الرائدة لمتابعة جديد السينما العالمية والعربية ومسلسلات الأنمي بأعلى دقة متوفرة.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-300">
            <Link href="/" className="hover:text-red-500 transition-colors">الرئيسية</Link>
            <Link href="/explore?cat=movies" className="hover:text-red-500 transition-colors">أفلام</Link>
            <Link href="/explore?cat=series" className="hover:text-red-500 transition-colors">مسلسلات</Link>
            <Link href="/explore" className="hover:text-red-500 transition-colors">المكتبة الشاملة</Link>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-500">
          <p>© {new Date().getFullYear()} سينما بلاس. جميع الحقوق محفوظة.</p>
          <p className="text-center">
            إخلاء مسؤولية: الموقع لا يستضيف أي ملفات فيديو على سيرفراته الخاصة، وجميع المحتويات مقدمة من أطراف ثالثة.
          </p>
        </div>
      </div>
    </footer>
  );
}
