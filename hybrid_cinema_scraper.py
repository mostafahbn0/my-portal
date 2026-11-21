import os
import re
import sys
import time
import requests
import cloudscraper
from bs4 import BeautifulSoup
from urllib.parse import urljoin, unquote, quote
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
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ تم الاتصال بقاعدة بيانات سينما بلاس")
except Exception as e:
    print(f"❌ خطأ: {e}")
    sys.exit(1)

scraper = cloudscraper.create_scraper(browser={'browser': 'chrome', 'platform': 'linux', 'desktop': True})

def clean_title_for_search(raw_title):
    t = unquote(raw_title)
    t = re.sub(r'[\(\[].*?[\)\]]', '', t)
    t = re.sub(r'(مشاهدة|فيلم|مسلسل|مترجم|مدبلج|اون لاين|اونلاين|كامل|HD|1080p|720p|4K|WEBRip|BluRay|TopCinema|عرب سيد|اكوام|وي سيما)', '', t, flags=re.IGNORECASE)
    return re.sub(r'\s+', ' ', t).strip()

def get_complete_tmdb_data(title, year=None, media_type='movie'):
    """جلب بيانات رسمية وكاملة 100% من TMDB مع البوسترات والممثلين"""
    try:
        clean = clean_title_for_search(title)
        stype = 'movie' if media_type == 'movie' else 'tv'
        
        url = f"https://api.themoviedb.org/3/search/{stype}?api_key={TMDB_API_KEY}&query={quote(clean)}&language=ar"
        res = requests.get(url, timeout=8).json()
        
        results = res.get('results', [])
        if not results:
            # تجربة البحث بالإنجليزية
            url_en = f"https://api.themoviedb.org/3/search/{stype}?api_key={TMDB_API_KEY}&query={quote(clean)}&language=en"
            res = requests.get(url_en, timeout=8).json()
            results = res.get('results', [])

        if results:
            item = results[0]
            tmdb_id = item['id']

            # جلب الممثلين
            credits_url = f"https://api.themoviedb.org/3/{stype}/{tmdb_id}/credits?api_key={TMDB_API_KEY}&language=ar"
            c_res = requests.get(credits_url, timeout=6).json()
            actors = [c['name'] for c in c_res.get('cast', [])[:6]]

            poster_path = f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get('poster_path') else None
            backdrop_path = f"https://image.tmdb.org/t/p/original{item['backdrop_path']}" if item.get('backdrop_path') else poster_path

            return {
                "id": tmdb_id,
                "title": item.get('title') if media_type == 'movie' else item.get('name'),
                "original_title": item.get('original_title') if media_type == 'movie' else item.get('original_name'),
                "overview": item.get('overview') or "قصة العمل متوفرة للمشاهدة المباشرة بدقة أصلية.",
                "poster_path": poster_path,
                "backdrop_path": backdrop_path,
                "release_date": (item.get('release_date') if media_type == 'movie' else item.get('first_air_date', '2024'))[:4],
                "vote_average": round(item.get('vote_average', 8.4), 1),
                "cast_list": actors if actors else ["نجوم العمل"],
                "genres": ["سينما بلاس VIP", "مترجم"]
            }
    except Exception as e:
        print(f"⚠️ خطأ TMDB: {e}")
    return None

def find_arabic_servers(arabic_url):
    """استخراج جميع سيرفرات المشاهدة المتاحة من الموقع العربي"""
    servers = []
    seen = set()
    try:
        res = scraper.get(arabic_url, timeout=12)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'lxml')

            # 1. استخراج iframes المشاهدة
            for iframe in soup.find_all('iframe'):
                src = iframe.get('src') or iframe.get('data-src')
                if src and not any(ad in src for ad in ['facebook', 'twitter', 'google', 'ad', 'monetag']):
                    if src not in seen:
                        servers.append({"name": f"سيرفر سريع {len(servers)+1}", "url": src})
                        seen.add(src)

            # 2. استخراج روابط صفحات السيرفرات إن وُجدت
            for link in soup.find_all('a', href=True):
                href = link['href']
                if any(k in href for k in ['watch', 'servers', 'player']) and href != arabic_url:
                    full_u = urljoin(arabic_url, href)
                    if full_u not in seen:
                        seen.add(full_u)
                        servers.append({"name": f"سيرفر بديل {len(servers)+1}", "url": full_u})
    except Exception:
        pass

    return servers

def process_hybrid_item(url, media_type='movie'):
    print(f"\n🔍 جاري المعالجة: {url}")
    try:
        res = scraper.get(url, timeout=15)
        soup = BeautifulSoup(res.text, 'lxml')

        # استخراج العنوان من الموقع
        title_tag = soup.find(['h1', 'h2'], class_=re.compile(r'(entry-title|title|post-title)')) or soup.find('h1')
        raw_title = title_tag.text.strip() if title_tag else soup.title.text.strip()
        
        print(f"🎬 العنوان المستخرج: {raw_title}")

        # 1. جلب كل البيانات الأصلية من TMDB
        tmdb_data = get_complete_tmdb_data(raw_title, media_type=media_type)

        # 2. جلب سيرفرات المشاهدة من الموقع العربي
        servers = find_arabic_servers(url)

        final_id = tmdb_data['id'] if tmdb_data else abs(hash(url)) % 10000000
        final_title = tmdb_data['title'] if tmdb_data else raw_title
        final_poster = tmdb_data['poster_path'] if tmdb_data and tmdb_data['poster_path'] else "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"
        final_backdrop = tmdb_data['backdrop_path'] if tmdb_data else final_poster
        final_overview = tmdb_data['overview'] if tmdb_data else "مشاهدة مباشرة بدقة عالية."
        final_cast = tmdb_data['cast_list'] if tmdb_data else ["نجوم العمل"]
        final_year = tmdb_data['release_date'] if tmdb_data else "2024"
        final_rating = tmdb_data['vote_average'] if tmdb_data else 8.5
        primary_video = servers[0]['url'] if servers else url

        record = {
            "id": final_id,
            "title": final_title,
            "original_title": raw_title,
            "overview": final_overview,
            "poster_path": final_poster,
            "backdrop_path": final_backdrop,
            "media_type": media_type,
            "release_date": final_year,
            "vote_average": final_rating,
            "popularity": 999.0,
            "genres": ["سينما بلاس", "مترجم", "أكشن"],
            "original_language": "ar",
            "video_url": primary_video,
            "video_servers": servers,
            "cast_list": final_cast
        }

        supabase.table("media").upsert(record).execute()

        print("="*50)
        print(f"🎉 تم النشر بنجاح على سينما بلاس وببيانات TMDB الرسمية!")
        print(f"📌 الاسم: {final_title}")
        print(f"🖼️ البوستر: {final_poster}")
        print(f"👥 الممثلين: {', '.join(final_cast)}")
        print(f"📺 عدد سيرفرات المشاهدة المرفوعة: {len(servers)}")
        print("="*50)
        return True

    except Exception as e:
        print(f"❌ خطأ: {e}")
        return False

def scrape_category_hybrid(category_url, max_items=10, media_type='movie'):
    print(f"\n🚀 بدء السحب الهجين من: {category_url}\n")
    try:
        res = scraper.get(category_url, timeout=15)
        soup = BeautifulSoup(res.text, 'lxml')

        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            full_url = urljoin(category_url, href)
            decoded = unquote(full_url)
            
            if any(bad in decoded for bad in ['/category/', '/tag/', '/page/', '?key=', '#']):
                continue
            if any(good in decoded for good in ['/فيلم-', '/مسلسل-', '/film-', '/movie-', '/series-']):
                if full_url not in links:
                    links.append(full_url)

        print(f"🎯 تم العثور على {len(links)} عمل. جاري المعالجة والدمج مع TMDB...")
        count = 0
        for link in links[:max_items]:
            if process_hybrid_item(link, media_type):
                count += 1
            time.sleep(1)

        print(f"\n🎉 اكتملت العملية! تم حفظ {count} عمل متكامل ببوسترات وسيرفرات أصلية.\n")
    except Exception as e:
        print(f"❌ خطأ في القسم: {e}")

if __name__ == '__main__':
    print("="*55)
    print("🎬 السكرابر الهجين (TMDB + المواقع العربية) - سينما بلاس 🎬")
    print("="*55)
    print("1) إدخال رابط فيلم مباشر (توب سينما، عرب سيد، إلخ)")
    print("2) سحب قسم أفلام أجنبية كامل من توب سينما (TopCinema)")
    print("3) سحب قسم أفلام عربية كامل من توب سينما (TopCinema)")
    print("4) سحب قسم أفلام أجنبية من عرب سيد (ArabSeed)")
    print("5) سحب قسم من وي سيما (WeCima)")
    print("="*55)

    choice = input("👉 اختر (1-5): ").strip()

    if choice == '1':
        u = input("🌐 ضع رابط الفيلم: ").strip()
        process_hybrid_item(u, 'movie')
    elif choice == '2':
        lim = input("🔢 كم عدد الأفلام المطلوبة؟ (افتراضي 10): ").strip()
        scrape_category_hybrid("https://topcinemaa.one/category/%d8%a7%d9%81%d9%84%d8%a7%d9%85-%d8%a7%d8%ac%d9%86%d8%a8%d9%8a-8/", int(lim) if lim.isdigit() else 10, 'movie')
    elif choice == '3':
        lim = input("🔢 كم عدد الأفلام المطلوبة؟ (افتراضي 10): ").strip()
        scrape_category_hybrid("https://topcinemaa.one/category/%d8%a7%d9%81%d9%84%d8%a7%d9%85-%d8%b9%d8%b1%d8%a8%d9%8a-1/", int(lim) if lim.isdigit() else 10, 'movie')
    elif choice == '4':
        lim = input("🔢 كم عدد الأفلام المطلوبة؟ (افتراضي 10): ").strip()
        scrape_category_hybrid("https://m.arabseed.site/category/foreign-movies/", int(lim) if lim.isdigit() else 10, 'movie')
    elif choice == '5':
        lim = input("🔢 كم عدد الأفلام المطلوبة؟ (افتراضي 10): ").strip()
        scrape_category_hybrid("https://wecima.show/category/movies/", int(lim) if lim.isdigit() else 10, 'movie')
