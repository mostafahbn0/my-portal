import './globals.css';
import { Cairo } from 'next/font/google';
const cairo = Cairo({ subsets: ['arabic'], weight: ['400', '700', '900'] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} bg-[#08080a] text-white min-h-screen`}>{children}</body>
    </html>
  );
}
