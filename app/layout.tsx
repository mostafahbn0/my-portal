import './globals.css'
export const metadata = { title: 'سينما بلاس', description: 'بوابة الأفلام العربية' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#08080a] text-white">{children}</body>
    </html>
  )
}
