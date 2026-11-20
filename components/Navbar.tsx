'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Film, Tv, Flame, Shuffle, MessageSquarePlus, X, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMediaPoster, getMediaYear, getMediaRating } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqType, setReqType] = useState('movie');
  const [reqSent, setReqSent] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // إغلاق نافذة البحث عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // بحث فوري ثنائي اللغة (عربي + إنجليزي)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length >= 2) {
        setLoading(true);
        try {
          const { data } = await supabase
            .from('media')
            .select('*')
            .or(`title.ilike.%${q}%,original_title.ilike.%${q}%`)
            .limit(7);

          setResults(data || []);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // الضغط على Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsOpen(false);
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // فشار الحظ (فيلم عشوائي)
  const handleRandomMovie = async () => {
    const { data } = await supabase.from('media').select('id').limit(50);
    if (data && data.length > 0) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      router.push(`/watch/${randomItem.id}`);
    }
  };

  // إرسال طلب ميديا
  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) return;
    try {
      await supabase.from('requests').insert([
        { title: reqTitle.trim(), media_type: reqType, status: 'pending' }
      ]);
      setReqSent(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setReqSent(false);
        setReqTitle('');
      }, 2000);
    } catch {
      setShowRequestModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#08080a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* اللوجو والروابط */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-red-600 via-red-500 to-amber-500 bg-clip-text text-transparent">
              سينما بلاس
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-300">
            <Link href="/" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-500" />
              الرئيسية
            </Link>
            <Link href="/explore?cat=أفلام أجنبية" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Film className="w-4 h-4 text-gray-400" />
              أفلام أجنبية
            </Link>
            <Link href="/explore?cat=أفلام عربية" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Film className="w-4 h-4 text-amber-500" />
              أفلام عربية
            </Link>
            <Link href="/explore?cat=مسلسلات" className="hover:text-red-500 transition-colors flex items-center gap-1.5">
              <Tv className="w-4 h-4 text-blue-500" />
              مسلسلات
            </Link>
          </nav>
        </div>

        {/* شريط البحث المطور */}
        <div ref={searchRef} className="relative flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث بالاسم الحقيقي أو العربي (Deadpool, كثيب...)"
              className="w-full bg-[#121318] text-white text-sm rounded-full pl-10 pr-10 py-2 border border-white/10 focus:border-red-600 focus:outline-none transition-all placeholder:text-gray-500"
            />
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(''); setIsOpen(false); }}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* القائمة المنسدلة لنتائج البحث */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#121318] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-sm text-gray-400">جاري البحث في الأرشيف...</div>
              ) : results.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {results.map((item) => {
                    const poster = getMediaPoster(item);
                    const realTitle = item.original_title || item.title;
                    const arabicTitle = item.title !== realTitle ? item.title : null;
                    const year = getMediaYear(item);
                    const rating = getMediaRating(item);

                    return (
                      <Link
                        key={item.id}
                        href={`/watch/${item.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition-colors group"
                      >
                        <img 
                          src={poster} 
                          alt={realTitle} 
                          className="w-10 h-14 object-cover rounded-md bg-[#1a1c23] flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white group-hover:text-red-500 truncate" dir="ltr" style={{ textAlign: 'right' }}>
                            {realTitle}
                          </p>
                          {arabicTitle && (
                            <p className="text-xs text-gray-400 truncate">{arabicTitle}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                            {year && <span>{year}</span>}
                            {Number(rating) > 0 && (
                              <span className="flex items-center gap-1 text-yellow-400 font-bold">
                                <Star className="w-3 h-3 fill-yellow-400" />
                                {rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-gray-400">
                  لا توجد نتائج مطابقة لـ &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* الأزرار الإضافية */}
        <div className="flex items-center gap-2">
          {/* فشار الحظ */}
          <button
            onClick={handleRandomMovie}
            title="فشار الحظ (فيلم عشوائي)"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-red-600/20 text-gray-300 hover:text-red-400 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/5 hover:border-red-600/30 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فشار الحظ</span>
          </button>

          {/* اطلب فيلم */}
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-md shadow-red-600/20"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">اطلب فيلماً</span>
          </button>
        </div>
      </div>

      {/* مودال طلب فيلم أو مسلسل */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121318] border border-white/10 rounded-2xl max-w-sm w-full p-5 relative">
            <button 
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">طلب عمل فني 🎬</h3>
            <p className="text-xs text-gray-400 mb-4">اكتب اسم الفيلم أو المسلسل وسنقوم بتوفيره بأسرع وقت.</p>

            {reqSent ? (
              <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-3 rounded-xl text-center text-sm font-bold">
                تم استلام طلبك بنجاح! سيتم توفيره قريباً.
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-3">
                <div>
                  <label className="text-xs text-gray-300 mb-1 block">اسم الفيلم أو المسلسل</label>
                  <input
                    type="text"
                    required
                    value={reqTitle}
                    onChange={(e) => setReqTitle(e.target.value)}
                    placeholder="مثال: Dune 2 أو الحشاشين..."
                    className="w-full bg-[#181a20] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-300 mb-1 block">النوع</label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full bg-[#181a20] text-white text-sm rounded-lg px-3 py-2 border border-white/10 focus:border-red-600 focus:outline-none"
                  >
                    <option value="movie">فيلم</option>
                    <option value="series">مسلسل</option>
                    <option value="anime">أنمي</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg text-sm transition-all"
                >
                  إرسال الطلب الآن
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
