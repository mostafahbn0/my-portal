"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Search, PlayCircle, Film, Tv, Sparkles, Shuffle, MessageSquarePlus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('فيلم');
  const [sent, setSent] = useState(false);

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
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-black text-red-600 flex items-center gap-2">
              <PlayCircle size={28} fill="currentColor" /> سينما بلاس
            </Link>
            <div className="hidden lg:flex gap-6 text-sm font-bold text-gray-300">
              <Link href="/" className="hover:text-red-500 transition">الرئيسية</Link>
              <Link href="/explore?type=movie" className="hover:text-red-500 transition">الأفلام</Link>
              <Link href="/explore?type=series" className="hover:text-red-500 transition">المسلسلات</Link>
              <Link href="/explore?type=anime" className="hover:text-red-500 transition">الأنمي</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-2.5 text-gray-500" size={16} />
              <input 
                placeholder="ابحث عن فيلمك أو مسلسلك..." 
                className="bg-white/5 border border-white/10 rounded-lg py-2 pr-9 pl-4 text-xs focus:outline-none focus:border-red-600 w-64 text-white" 
              />
            </div>
            
            <button 
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <MessageSquarePlus size={16} /> اطلب عملك
            </button>
          </div>
        </div>
      </nav>

      {/* مودال اطلب عملك */}
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
                  <label className="text-xs text-gray-400 block mb-1">اسم العمل</label>
                  <input 
                    value={requestTitle}
                    onChange={(e) => setRequestTitle(e.target.value)}
                    required
                    placeholder="مثال: Oppenheimer أو ون بيس..." 
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
