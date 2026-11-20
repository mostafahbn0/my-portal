"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, PlayCircle, Film, Tv, Sparkles, Shuffle, MessageSquarePlus, X, Loader2, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMediaPoster, getMediaYear } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('فيلم');
  const [sent, setSent] = useState(false);

  // حالة البحث اللحظي
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // بحث ثنائي اللغة (عربي + إنجليزي)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      const cleanTerm = searchTerm.trim();
      
      // يبحث في الحقل العربي والحقل الإنجليزي معاً
      const { data } = await supabase
        .from('media')
        .select('*')
        .or(`title.ilike.%${cleanTerm}%,original_title.ilike.%${cleanTerm}%`)
        .limit(6);

      setSearchResults(data || []);
      setSearchLoading(false);
      setShowResults(true);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setShowResults(false);
      router.push(`/explore?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleRandomMovie = async () => {
    const { data } = await supabase.from('media').select('id');
    if (data && data.length > 0) {
      const randomItem = data[Math.floor(Math.random() * data.length)];
      router.push(`/watch/${randomItem.id}`);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTitle.trim()) return;
    await supabase.from('requests').insert([{ title: requestTitle, type: requestType }]);
    setSent(true);
    setTimeout(() => {
      setShowModal(false);
      setSent(false);
      setRequestTitle('');
    }, 1500);
  };

  return (
    <>
      <nav className="bg-[#08080a]/95 backdrop-blur-md sticky top-0 z-40 border-b border-white/5 py-3">
        <div className="container mx-auto px-4 flex justify-between items-center gap-4">
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl sm:text-2xl font-black text-red-600 flex items-center gap-2 tracking-tighter">
              <PlayCircle size={28} fill="currentColor" /> سينما بلاس
            </Link>
            
            <div className="hidden lg:flex gap-5 text-xs font-bold text-gray-300">
              <Link href="/" className="hover:text-red-500 transition">الرئيسية</Link>
              <Link href="/explore?type=movie" className="hover:text-red-500 transition flex items-center gap-1">
                <Film size={14} /> الأفلام
              </Link>
              <Link href="/explore?type=series" className="hover:text-red-500 transition flex items-center gap-1">
                <Tv size={14} /> المسلسلات
              </Link>
              <Link href="/explore?type=anime" className="hover:text-red-500 transition flex items-center gap-1">
                <Sparkles size={14} /> الأنمي
              </Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            
            <div ref={searchRef} className="relative w-48 sm:w-64 md:w-80">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  placeholder="ابحث بالعربي أو الإنجليزي..." 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pr-9 pl-8 text-xs text-white focus:outline-none focus:border-red-600 transition" 
                />
                <Search className="absolute right-3 top-2.5 text-gray-400" size={15} />
                {searchLoading ? (
                  <Loader2 className="absolute left-2.5 top-2.5 text-red-500 animate-spin" size={14} />
                ) : searchTerm ? (
                  <button type="button" onClick={() => { setSearchTerm(''); setShowResults(false); }} className="absolute left-2.5 top-2.5 text-gray-400 hover:text-white">
                    <X size={14} />
                  </button>
                ) : null}
              </form>

              {/* القائمة العائمة مع إظهار الاسمين */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 inset-x-0 bg-[#121216] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5">
                  {searchResults.map((item) => (
                    <Link
                      key={item.id}
                      href={`/watch/${item.id}`}
                      onClick={() => setShowResults(false)}
                      className="flex items-center gap-3 p-2.5 hover:bg-white/5 transition group"
                    >
                      <img 
                        src={getMediaPoster(item)} 
                        alt="" 
                        className="w-10 h-14 object-cover rounded border border-white/10 flex-shrink-0"
                      />
                      <div className="overflow-hidden flex-1 text-right">
                        <p className="text-xs font-bold text-white group-hover:text-red-500 transition truncate">
                          {item.title}
                        </p>
                        {item.original_title && item.original_title !== item.title && (
                          <p className="text-[10px] text-gray-400 truncate font-sans">
                            {item.original_title}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500">
                          <span>{getMediaYear(item)}</span>
                          <span>•</span>
                          <span className="text-red-500 font-bold">{item.type === 'movie' ? 'فيلم' : item.type === 'anime' ? 'أنمي' : 'مسلسل'}</span>
                          {item.vote_average && (
                            <span className="flex items-center gap-0.5 text-yellow-500 mr-auto font-bold">
                              <Star size={10} fill="currentColor" /> {Number(item.vote_average).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full py-2.5 text-center text-xs font-bold text-red-500 hover:bg-red-600/10 transition block"
                  >
                    عرض كل نتائج البحث لـ "{searchTerm}"
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleRandomMovie}
              title="فشار الحظ: عمل عشوائي"
              className="bg-white/5 hover:bg-white/10 text-white p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/5"
            >
              <Shuffle size={15} className="text-red-500" />
              <span className="hidden sm:inline">فشار الحظ</span>
            </button>

            <button 
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-red-600/30"
            >
              <MessageSquarePlus size={15} />
              <span className="hidden sm:inline">اطلب عملك</span>
            </button>
          </div>

        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121216] border border-white/10 p-6 rounded-2xl w-full max-w-md relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 left-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
              <MessageSquarePlus className="text-red-600" /> طلب عمل سينمائي
            </h3>
            {sent ? (
              <p className="text-green-500 py-4 text-center font-bold">تم إرسال طلبك بنجاح! سيتم إضافته قريباً.</p>
            ) : (
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">اسم العمل (عربي أو إنجليزي)</label>
                  <input 
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    required
                    placeholder="مثال: Interstellar أو ون بيس..." 
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">النوع</label>
                  <select 
                    value={requestType} 
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full bg-[#1c1c22] border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="فيلم">فيلم</option>
                    <option value="مسلسل">مسلسل</option>
                    <option value="أنمي">أنمي</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-red-600 hover:bg-red-700 py-2.5 rounded-lg font-bold text-sm text-white transition">
                  إرسال الطلب
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
