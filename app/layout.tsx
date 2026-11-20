import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({ 
  subsets: ["arabic"],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "سينما بلاس | مشاهدة أحدث الأفلام والمسلسلات مترجمة",
  description: "المنصة الأولى لمشاهدة وتحميل الأفلام والمسلسلات العربية والأجنبية والأنمي بأعلى جودة 4K مترجمة للعربية.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        {/* كود توثيق موني تاج - إجباري في الرأس */}
        <meta name="monetag" content="3e81a1f47455d827e8622e53ef6a6ed9" />
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className={`${cairo.className} bg-[#08080a] text-white selection:bg-red-600/30 selection:text-red-500 overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
