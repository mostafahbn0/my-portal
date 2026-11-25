import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'سينما بلاس VIP | مشاهدة أحدث الأفلام والمسلسلات 4K مجاناً',
  description: 'منصة سينما بلاس لمشاهدة وتحميل أحدث أفلام هوليوود ومسلسلات نتفليكس ومسلسلات رمضان 2025 والأنمي مجاناً بأعلى جودة.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
