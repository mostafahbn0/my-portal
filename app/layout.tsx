import './globals.css';

export const metadata = {
  title: 'سينما بلاس | مشاهدة وتحميل أحدث الأفلام والمسلسلات',
  description: 'بوابة الأفلام والمسلسلات العربية والأجنبية بجودة عالية بدون إعلانات مزعجة',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* السطر ده بيمنع حظر الـ Hotlinking من TMDB سيرفرات الصور */}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body className="bg-[#08080a] text-white min-h-screen">{children}</body>
    </html>
  );
}
