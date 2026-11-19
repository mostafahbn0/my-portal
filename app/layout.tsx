import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AntiAdblockModal from '@/components/AntiAdblockModal'
import StickyBottomAd from '@/components/StickyBottomAd'
import { supabaseServer } from '@/lib/supabase/server'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '900'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'سينما بلس | مشاهدة وتحميل أحدث الأفلام والمسلسلات والأنمي مترجم HD',
  description: 'موقع سينما بلس لمشاهدة وتحميل أحدث الأفلام والمسلسلات والأنمي المترجم بجودة فائقة وبدون إعلانات مزعجة مجاناً وبسيرفرات سريعة.',
  metadataBase: new URL('https://cinemaplus.com'),
  keywords: ['أفلام', 'مسلسلات', 'مشاهدة مباشرة', 'تحميل أفلام', 'أنمي مترجم', 'سينما بلس'],
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://cinemaplus.com',
    siteName: 'سينما بلس',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = supabaseServer()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .single()

  return (
    <html lang="ar" dir="rtl" className="dark">
      <head>
        {/* Pop-under Script Injection */}
        {settings?.ad_popunder_code && (
          <script
            dangerouslySetInnerHTML={{
              __html: settings.ad_popunder_code,
            }}
          />
        )}
      </head>
      <body className={`${cairo.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col selection:bg-rose-600 selection:text-white`}>
        {settings?.anti_adblock_enabled && <AntiAdblockModal />}
        
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <StickyBottomAd />
      </body>
    </html>
  )
}
