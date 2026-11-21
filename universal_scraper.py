import os
import re
import sys
import time
import requests
import cloudscraper
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
from supabase import create_client, Client

# --- قراءة المفاتيح التلقائية ---
def load_env_credentials():
    env_vars = {}
    for p in ['.env.local', '.env']:
        if os.path.exists(p):
            with open(p, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        k, v = line.split('=', 1)
                        env_vars[k.strip()] = v.strip().strip("'").strip('"')
    return env_vars

env = load_env_credentials()
TMDB_API_KEY = env.get("TMDB_API_KEY", "204ce203e280acdfec221ea09ea5e763")
SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "https://pcgwfnevqoowerjeyhgk.supabase.co")
SUPABASE_KEY = env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or env.get("SUPABASE_SERVICE_ROLE_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ تم الاتصال بقاعدة بيانات Supabase بنجاح")
except Exception as e:
    print(f"❌ خطأ في الاتصال بـ Supabase: {e}")
    sys.exit(1)

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'linux', 'desktop': True})

def clean_arabic_title(raw_title):
    t = unquote(raw_title)
    t = re.sub(r'[\(\[].*?[\)\]]', '', t)
    t = re.sub(r'(مشاهدة|فيلم|مسلسل|مترجم|مدبلج|اون لاين|اونلاين|كامل|HD|1080p|720p|4K|WEBRip|BluRay|TopCinema|عرب سيد|اكوام|وي سيما|فاصل اعلاني)', '', t, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', t).strip()

def extract_real_player(page_url, soup):
    """استخراج رابط سيرفر العرض المباشر (Iframe)"""
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src') or iframe.get('data-src')
        if src and not any(ad in src for ad in ['facebook', 'twitter', 'google', 'ad', 'monetag', 'histats']):
            return src

    # البحث عن روابط المشاهدة الداخلية
    watch_link = soup.find('a', href=re.compile(r'(watch|embed|servers|video|play)'))
    if watch_link and watch_link.get('href'):
        target_link = urljoin(page_url, watch_link.get('href'))
        if target_link != page_url:
            try:
                sub_res = scraper.get(target_link, timeout=8)
                sub_soup = BeautifulSoup(sub_res.text, 'lxml')
                for sub_iframe in sub_soup.find_all('iframe'):
                    sub_src = sub_iframe.get('src') or sub_iframe.get('data-src')
                    if sub_src:
                        return sub_src
            except Exception:
                pass

    return page_url

def parse_and_save_item(url, media_type='movie'):
    try:
        url = unquote(url)
        print(f"\n🔍 جاري معالجة وسحب: {url}")
        res = scraper.get(url, timeout=15)
        if res.status_code != 200:
            print(f"⚠️ فشل فتح الصفحة ({res.status_code})")
            return False

        soup = BeautifulSoup(res.text, 'lxml')

        # استخراج العنوان
        title_el = soup.find(['h1', 'h2'], class_=re.compile(r'(entry-title|title|post-title|film-title)')) or soup.find('h1')
        raw_title = title_el.text.strip() if title_el else (soup.title.text.strip() if soup.title else "فيلم جديد")
        cleaned_title = clean_arabic_title(raw_title)

        # استخراج القصة
        story_el = soup.find(['div', 'p'], class_=re.compile(r'(story|overview|description|entry-content|details|post-entry)'))
        overview = story_el.text.strip() if story_el else "قصة العمل متوفرة للمشاهدة المباشرة بجودة عالية."
        overview = re.sub(r'\s+', ' ', overview)

        # استخراج البوستر
        img_el = soup.find('img', class_=re.compile(r'(poster|thumb|attachment)')) or soup.find('meta', property='og:image')
        poster = None
        if img_el:
            poster = img_el.get('src') or img_el.get('content') or img_el.get('data-src')

        # استخراج سيرفر المشاهدة المباشر
        video_player_url = extract_real_player(url, soup)

        # تحسين البوستر والبيانات من TMDB إن أمكن
        backdrop_path = poster
        unique_id = abs(hash(url)) % 10000000

        try:
            search_query = cleaned_title if len(cleaned_title) > 2 else raw_title
            t_res = requests.get(f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={requests.utils.quote(search_query)}&language=ar", timeout=5).json()
            if t_res.get('results'):
                t_item = t_res['results'][0]
                if t_item.get('id'):
                    unique_id = t_item['id']
                if t_item.get('poster_path'):
                    poster = f"https://image.tmdb.org/t/p/w500{t_item['poster_path']}"
                if t_item.get('backdrop_path'):
                    backdrop_path = f"https://image.tmdb.org/t/p/original{t_item['backdrop_path']}"
                if t_item.get('overview'):
                    overview = t_item['overview']
        except Exception:
            pass

        if not poster:
            poster = "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"

        record = {
            "id": unique_id,
            "title": cleaned_title if len(cleaned_title) > 2 else raw_title,
            "original_title": raw_title,
            "overview": overview,
            "poster_path": poster,
            "backdrop_path": backdrop_path,
            "media_type": media_type,
            "release_date": "2024",
            "vote_average": 8.5,
            "popularity": 999.0,
            "genres": ["سينما", "مترجم", "أكشن"],
            "original_language": "ar",
            "video_url": video_player_url
        }

        # حفظ في Supabase
        supabase.table("media").upsert(record).execute()

        print("="*45)
        print(f"✨ تم النشر بنجاح على سينما بلاس!")
        print(f"🎬 العمل: {record['title']}")
        print(f"🆔 ID: {unique_id}")
        print(f"📺 سيرفر العرض: {video_player_url}")
        print("="*45)
        return True

    except Exception as e:
        print(f"❌ خطأ: {e}")
        return False

def scrape_category(category_url, max_items=15, media_type='movie'):
    print(f"\n🚀 بدء سحب القسم: {category_url}\n")
    try:
        res = scraper.get(category_url, timeout=15)
        soup = BeautifulSoup(res.text, 'lxml')
        
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(category_url, href)
            decoded_url = unquote(full_url)
            
            # فلترة: استبعاد روابط الأقسام والصفحات والتصنيفات
            if any(bad in decoded_url for bad in ['/category/', '/tag/', '/page/', '?key=', '/genres/', '#', 'wp-login']):
                continue

            # قبول روابط الأفلام والمسلسلات الحقيقية فقط
            if any(good in decoded_url for good in ['/فيلم-', '/مسلسل-', '/film-', '/movie-', '/series-', '/watch/']):
                if full_url not in links:
                    links.append(full_url)

        print(f"🎯 تم استخراج {len(links)} رابط فيلم فعلي. جاري السحب حتى {max_items}...")
        
        count = 0
        for link in links[:max_items]:
            if parse_and_save_item(link, media_type):
                count += 1
            time.sleep(1)

        print(f"\n🎉 اكتمل السحب بنجاح! تمت إضافة {count} عمل صالح 100% لموقعك.\n")
    except Exception as err:
        print(f"❌ خطأ أثناء قراءة القسم: {err}")

if __name__ == '__main__':
    print("="*45)
    print("🎬 سكرابر سينما بلاس الذكي للمواقع العربية 🎬")
    print("="*45)
    print("1) سحب فيلم مفرد")
    print("2) سحب قسم كامل (أفلام أجنبية، عربية، مسلسلات)")
    print("3) الخروج")
    print("="*45)
    
    choice = input("👉 اختر (1-3): ").strip()
    if choice == '1':
        u = input("🌐 ضع رابط الفيلم: ").strip()
        parse_and_save_item(u, 'movie')
    elif choice == '2':
        u = input("🌐 ضع رابط القسم: ").strip()
        n = input("🔢 كم عدد الأعمال المطلوبة (افتراضي 15): ").strip()
        num = int(n) if n.isdigit() else 15
        scrape_category(u, num, 'movie')
