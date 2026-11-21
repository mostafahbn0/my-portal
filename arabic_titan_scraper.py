import os
import re
import sys
import time
import requests
import cloudscraper
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote
from supabase import create_client, Client

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
    print("✅ تم الاتصال بقاعدة بيانات سينما بلاس (Supabase) بنجاح")
except Exception as e:
    print(f"❌ خطأ: {e}")
    sys.exit(1)

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'linux', 'desktop': True})

def clean_arabic_title(raw_title):
    t = unquote(raw_title)
    t = re.sub(r'[\(\[].*?[\)\]]', '', t)
    t = re.sub(r'(مشاهدة|فيلم|مسلسل|مترجم|مدبلج|اون لاين|اونلاين|كامل|HD|1080p|720p|4K|WEBRip|BluRay|TopCinema|عرب سيد|اكوام|وي سيما|Arabseed|Akwam|WeCima)', '', t, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', t).strip()

def extract_multi_servers(soup, page_url):
    """استخراج جميع سيرفرات المشاهدة المتاحة للفيلم/الحلقة لضمان عملها 100%"""
    servers = []
    seen = set()

    # 1. فحص جميع عناصر Iframe
    for iframe in soup.find_all('iframe'):
        src = iframe.get('src') or iframe.get('data-src')
        if src and not any(ad in src for ad in ['facebook', 'twitter', 'google', 'ad', 'monetag', 'histats']):
            if src not in seen:
                servers.append({"name": f"سيرفر VIP {len(servers)+1}", "url": src})
                seen.add(src)

    # 2. فحص أزرار وقوائم السيرفرات في عرب سيد ووي سيما وتوب سينما
    for link in soup.find_all('a', href=True):
        href = link['href']
        if any(k in href for k in ['watch', 'servers', 'player', 'video']) and href != page_url:
            full_srv = urljoin(page_url, href)
            if full_srv not in seen and len(full_srv) > 20:
                seen.add(full_srv)
                try:
                    sub_r = scraper.get(full_srv, timeout=6)
                    sub_soup = BeautifulSoup(sub_r.text, 'lxml')
                    for s_iframe in sub_soup.find_all('iframe'):
                        s_src = s_iframe.get('src') or s_iframe.get('data-src')
                        if s_src and s_src not in [s['url'] for s in servers]:
                            servers.append({"name": f"سيرفر سريع {len(servers)+1}", "url": s_src})
                except Exception:
                    pass

    return servers

def process_and_save_item(url, media_type='movie', season_num=1, parent_id=None):
    try:
        url = unquote(url)
        print(f"🔍 فحص واستخراج: {url}")
        res = scraper.get(url, timeout=15)
        if res.status_code != 200:
            print(f"⚠️ فشل فتح الرابط ({res.status_code})")
            return False

        soup = BeautifulSoup(res.text, 'lxml')

        # استخراج العنوان
        title_el = soup.find(['h1', 'h2'], class_=re.compile(r'(entry-title|title|post-title|film-title)')) or soup.find('h1')
        raw_title = title_el.text.strip() if title_el else soup.title.text.strip()
        cleaned_title = clean_arabic_title(raw_title)

        # استخراج القصة
        story_el = soup.find(['div', 'p'], class_=re.compile(r'(story|overview|description|entry-content|details|post-entry)'))
        overview = story_el.text.strip() if story_el else "مشاهدة مباشرة بدقة عالية مع ترجمة عربية مدمجة."
        overview = re.sub(r'\s+', ' ', overview)

        # استخراج البوستر الخاص بالصفحة
        img_el = soup.find('img', class_=re.compile(r'(poster|thumb|attachment)')) or soup.find('meta', property='og:image')
        poster = None
        if img_el:
            poster = img_el.get('src') or img_el.get('content') or img_el.get('data-src')

        # استخراج السيرفرات المتعددة
        servers = extract_multi_servers(soup, url)
        primary_video = servers[0]['url'] if servers else url

        # جلب تفاصيل إضافية من TMDB
        unique_id = abs(hash(url)) % 10000000
        backdrop = poster
        cast_list = ["نجوم السينما"]

        try:
            t_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={requests.utils.quote(cleaned_title)}&language=ar"
            t_res = requests.get(t_url, timeout=5).json()
            if t_res.get('results'):
                item = t_res['results'][0]
                unique_id = item.get('id', unique_id)
                if item.get('poster_path') and not poster:
                    poster = f"https://image.tmdb.org/t/p/w500{item['poster_path']}"
                if item.get('backdrop_path'):
                    backdrop = f"https://image.tmdb.org/t/p/original{item['backdrop_path']}"
                if item.get('overview'):
                    overview = item['overview']
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
            "backdrop_path": backdrop or poster,
            "media_type": media_type,
            "release_date": "2024",
            "vote_average": 8.6,
            "popularity": 999.0,
            "genres": ["سينما بلاس", "مترجم", "حصري"],
            "original_language": "ar",
            "video_url": primary_video,
            "video_servers": servers,
            "season_number": season_num,
            "parent_id": parent_id,
            "cast_list": cast_list
        }

        supabase.table("media").upsert(record).execute()
        print(f"✨ تم النشر: [{record['title']}] | عدد السيرفرات: {len(servers)}")
        return True

    except Exception as e:
        print(f"❌ خطأ في الحفظ: {e}")
        return False

def scrape_category(category_url, max_items=10, media_type='movie'):
    print(f"\n🚀 بدء سحب المحتوى من: {category_url}\n")
    try:
        res = scraper.get(category_url, timeout=15)
        soup = BeautifulSoup(res.text, 'lxml')

        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(category_url, href)
            decoded = unquote(full_url)
            
            if any(bad in decoded for bad in ['/category/', '/tag/', '/page/', '?key=', '#', 'wp-login']):
                continue
            if any(good in decoded for good in ['/فيلم-', '/مسلسل-', '/film-', '/movie-', '/series-', '/watch/', '/post/']):
                if full_url not in links:
                    links.append(full_url)

        print(f"🎯 تم العثور على {len(links)} عمل جاهز للسحب. جاري المعالجة...")
        count = 0
        for link in links[:max_items]:
            if process_and_save_item(link, media_type):
                count += 1
            time.sleep(1)

        print(f"\n🎉 تم الانتهاء بنجاح! تم إضافة {count} عمل في موقعك.\n")
    except Exception as e:
        print(f"❌ خطأ: {e}")

if __name__ == '__main__':
    print("="*55)
    print("🎬 سكرابر تيتان (المواقع العربية الأربعة) - سينما بلاس 🎬")
    print("="*55)
    print("1) توب سينما (TopCinema) - أحدث الأفلام الأجنبية")
    print("2) توب سينما (TopCinema) - أحدث الأفلام العربية والمصرية")
    print("3) توب سينما (TopCinema) - المسلسلات الحصرية")
    print("4) عرب سيد (ArabSeed) - أحدث الأفلام")
    print("5) وي سيما (WeCima) - أقوى الإنتاجات")
    print("6) أكوام (Akwam) - عروض حصرية")
    print("7) إدخال رابط مخصص (فيلم أو قسم كامل)")
    print("="*55)

    choice = input("👉 اختر رقم المصدر (1-7): ").strip()
    limit = input("🔢 كم عدد الأعمال المطلوبة؟ (افتراضي 10): ").strip()
    max_num = int(limit) if limit.isdigit() else 10

    sources = {
        '1': ("https://topcinemaa.one/category/%d8%a7%d9%81%d9%84%d8%a7%d9%85-%d8%a7%d8%ac%d9%86%d8%a8%d9%8a-8/", 'movie'),
        '2': ("https://topcinemaa.one/category/%d8%a7%d9%81%d9%84%d8%a7%d9%85-%d8%b9%d8%b1%d8%a8%d9%8a-1/", 'movie'),
        '3': ("https://topcinemaa.one/category/%d9%85%d8%b3%d9%84%d8%b3%d9%84%d8%a7%d8%aa-%d8%a7%d8%ac%d9%86%d8%a8%d9%8a/", 'tv'),
        '4': ("https://m.arabseed.site/category/foreign-movies/", 'movie'),
        '5': ("https://wecima.show/category/movies/", 'movie'),
        '6': ("https://akwam.cz/movies", 'movie')
    }

    if choice in sources:
        url, mtype = sources[choice]
        scrape_category(url, max_num, mtype)
    elif choice == '7':
        custom_url = input("🌐 ضع الرابط هنا: ").strip()
        custom_type = input("هل هو فيلم (movie) أم مسلسل (tv)؟: ").strip() or 'movie'
        if any(k in custom_url for k in ['category', 'genre', 'movies', 'series']):
            scrape_category(custom_url, max_num, custom_type)
        else:
            process_and_save_item(custom_url, custom_type)
    else:
        print("تم الإلغاء.")
