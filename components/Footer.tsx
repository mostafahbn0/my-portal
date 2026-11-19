import Link from 'next/link'
import { Film, Send } from 'lucide-react'

// Custom SVGs for Social Platforms (No external icon package issues)
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )
}

function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 mt-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black text-rose-500">
              <Film className="w-8 h-8" />
              <span>سينما<span className="text-white">بلس</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              منصتك الأولى لمشاهدة وتحميل أحدث الأفلام والمسلسلات والأنمي المترجم بجودة فائقة وبدون إعلانات مزعجة.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-rose-400 transition-colors">الرئيسية</Link></li>
              <li><Link href="/explore?type=movie" className="hover:text-rose-400 transition-colors">الأفلام</Link></li>
              <li><Link href="/explore?type=series" className="hover:text-rose-400 transition-colors">المسلسلات</Link></li>
              <li><Link href="/explore?type=anime" className="hover:text-rose-400 transition-colors">الأنمي</Link></li>
              <li><Link href="/favorites" className="hover:text-rose-400 transition-colors">قائمتي المفضلة</Link></li>
            </ul>
          </div>

          {/* Explore Sections */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">التصنيفات</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/explore?genre=أكشن" className="hover:text-rose-400 transition-colors">أفلام أكشن</Link></li>
              <li><Link href="/explore?genre=دراما" className="hover:text-rose-400 transition-colors">مسلسلات دراما</Link></li>
              <li><Link href="/explore?genre=رعب" className="hover:text-rose-400 transition-colors">أفلام رعب</Link></li>
              <li><Link href="/explore?genre=كوميديا" className="hover:text-rose-400 transition-colors">كوميديا</Link></li>
            </ul>
          </div>

          {/* Community & Socials */}
          <div>
            <h4 className="text-white font-bold mb-4 text-base">تابعنا وتواصل معنا</h4>
            <p className="text-xs text-slate-400 mb-4">انضم لقناتنا على تليجرام للحصول على أحدث الروابط فور صدورها.</p>
            <div className="flex items-center gap-3">
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-300"
                title="Telegram"
              >
                <Send className="w-5 h-5 -ml-0.5" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-300"
                title="Facebook"
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-300"
                title="Twitter / X"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all text-slate-300"
                title="Instagram"
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-400 space-y-2">
          <p>
            إخلاء مسؤولية: موقع سينما بلس لا يقوم بتخزين أي مواد على خوادمه، وجميع الروابط المتاحة مستضافة على مواقع أطراف ثالثة خارجية ومتاحة للعامة.
          </p>
          <p>© {new Date().getFullYear()} سينما بلس. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  )
}
