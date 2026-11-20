"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AdBannerProps {
  type: 'top' | 'sticky' | 'rectangle' | 'inline';
}

export default function AdBanner({ type }: AdBannerProps) {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  if (type === 'sticky') {
    return (
      <div className="fixed bottom-0 inset-x-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-red-600/30 p-2 flex items-center justify-center shadow-2xl">
        <button 
          onClick={() => setClosed(true)}
          className="absolute -top-4 right-4 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs shadow transition"
          title="إغلاق الإعلان"
        >
          <X size={14} />
        </button>
        <div className="w-[728px] max-w-full h-[70px] bg-white/5 border border-dashed border-white/10 rounded flex items-center justify-center text-xs text-gray-500">
          <span>مساحة إعلانية ثابتة (728×90 Responsive)</span>
        </div>
      </div>
    );
  }

  if (type === 'rectangle') {
    return (
      <div className="w-full h-[250px] bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-gray-500">
        <span>مساحة إعلانية مربعة (300×250)</span>
      </div>
    );
  }

  if (type === 'top') {
    return (
      <div className="container mx-auto px-4 my-4">
        <div className="w-full h-[90px] bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-gray-500">
          <span>بانر إعلاني علوي (Leaderboard 728×90)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full my-8">
      <div className="w-full h-[90px] bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-xs text-gray-500">
        <span>بانر إعلاني مدمج بين المحتوى</span>
      </div>
    </div>
  );
}
