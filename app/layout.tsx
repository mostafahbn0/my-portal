import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Script from 'next/script';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-tajawal',
});

export const metadata: Metadata = {
  title: 'سينما بلاس | Cinema Plus - مشاهدة وتحميل أفلام ومسلسلات مترجمة مجاناً',
  description: 'منصة سينما بلاس الأولى عربياً لمشاهدة أحدث أفلام هوليوود، مسلسلات نيتفلكس، والأنمي المترجم بجودة عالية 1080p و 4K بدون تقطيع.',
  metadataBase: new URL('https://my-portal-nu-liart.vercel.app'),
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
        <meta name="monetag" content="3e81a1f47455d827e8622e53ef6a6ed9" />

        {/* 1. Monetag Vignette Ads (إعلانات بينية عالية الربح وآمنة) */}
        <script src="https://n6wxm.com/vignette.min.js" data-zone="12311724" data-cfasync="false" async></script>

        {/* 2. Monetag Popunder Safe MultiTag */}
        <script src="https://5gvci.com/act/files/tag.min.js?z=12311722" data-cfasync="false" async></script>
      </head>
      <body className="bg-[#08080a] text-white font-sans antialiased min-h-screen selection:bg-red-600 selection:text-white">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
