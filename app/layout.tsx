import './globals.css'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>سينما بلاس</title>
      </head>
      <body className="bg-[#08080a] text-white">{children}</body>
    </html>
  )
}
