import { Suspense } from 'react';

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>{children}</Suspense>;
}
