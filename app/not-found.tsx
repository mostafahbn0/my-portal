import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-extrabold bg-gradient-to-l from-red-500 to-blue-500 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold mb-2">الصفحة غير موجودة</h1>
        <p className="text-slate-400 mb-8">الصفحة اللي تدوّر عليها مش موجودة أو تم حذفها</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-bold transition"
          >
            <Home className="w-5 h-5" />
            الرئيسية
          </Link>
          <Link
            href="/search"
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition"
          >
            <Search className="w-5 h-5" />
            بحث
          </Link>
        </div>
      </div>
    </div>
  );
}
