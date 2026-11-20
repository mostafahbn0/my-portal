'use client';
import React from 'react';
import Link from 'next/link';
import { Play, Home, Film, Tv, PlusCircle } from 'lucide-react';
export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[100] bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/5 h-20 flex items-center px-4 md:px-12 justify-between">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-xl text-white"><Play size={22} fill="white" /></div>
          <span className="text-2xl font-black italic text-white tracking-tighter">سينما<span className="text-red-600">بلاس</span></span>
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-gray-400">
          <Link href="/" className="text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg flex items-center gap-2">الرئيسية</Link>
          <Link href="/explore?type=movie" className="hover:text-white transition">الأفلام</Link>
          <Link href="/explore?type=series" className="hover:text-white transition">المسلسلات</Link>
        </div>
      </div>
      <button className="bg-white/5 px-4 py-2.5 rounded-xl text-[10px] font-black border border-white/5 text-gray-200 flex items-center gap-2">
        <PlusCircle size={14} className="text-red-600" /> اطلب عملك
      </button>
    </nav>
  );
}
