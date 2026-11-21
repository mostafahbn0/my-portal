import re
import sys
import time
import requests
import cloudscraper
from bs4 import BeautifulSoup
from supabase import create_client, Client

# --- إعدادات Supabase و TMDB ---
TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjgwNzc3MywiZXhwIjoyMDUyMzgzNzczfQ.c47YAnq5Ede_bYpWqYc1nLso19QpPZJ2fXqI3Xv1bX0"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
scraper = cloudscraper.create_scraper()

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def enrich_from_tmdb(title, media_type='movie'):
    """البحث في TMDB لملء أي نقص في البوسترات عالية الدقة وطاقم الممثلين"""
    try:
        clean_name = re.sub(r'[\(\[].*?[\)\]]', '', title)
        clean_name = re.sub(r'(فيلم|مسلسل|مترجم|مدبلج|HD|1080p|720p|WEBRip)', '', clean_name).strip()
        
        search_type = 'movie' if media_type == 'movie' else 'tv'
        url = f"https://api.themoviedb.org/3/search/{search_type}?api_key={TMDB_API_KEY}&query={clean_name}&language=ar"
        res = requests.get(url, timeout=6).json()
        
        results = res.get('results', [])
        if results:
            item = results[0]
            tmdb_id = item.get('id')
            
            # جلب الممثلين
            credits_url = f"https://api.themoviedb.org/3/{search_type}/{tmdb_id}/credits?api_key={TMDB_API_KEY}&language=ar"
            c_res = requests.get(credits_url, timeout=6).json()
            cast_list = [c['name'] for c in c_res.get('cast', [])[:5]]

            return {
                "tmdb_id": tmdb_id,
                "backdrop_path": f"https://image.tmdb.org/t/p/original{item.get('backdrop_path')}" if item.get('backdrop_path') else None,
                "poster_path": f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else None,
                "vote_average": item.get('vote_average', 8.0),
                "cast": cast_list
            }
    except Exception:
        pass
    return None

def parse_and_save_item(url, media_type='movie'):
    try:
        print(f"🔍 فحص الرابط: {url}")
        res = scraper.get(url, timeout=15)
        if res.status_code != 200:
            print(f"⚠️ فشل الاتصال بالصفحة ({res.status_code})")
            return False

        soup = BeautifulSoup(res.text, 'lxml')

        # استخراج العنوان
        title_el = soup.find(['h1', 'h2'], class_=re.compile(r'(entry-title|title|post-title|film-title)')) or soup.find('h1')
        title = clean_text(title_el.text) if title_el else soup.title.text

        # استخراج القصة
        story_el = soup.find(['div', 'p'], class_=re.compile(r'(story|overview|description|entry-content|details)'))
        overview = clean_text(story_el.text) if story_el else "قصة العمل متاحة للمشاهدة المباشرة بجودة عالية."

        # استخراج البوستر
        img_el = soup.find('img', class_=re.compile(r'(poster|thumb|attachment)')) or soup.find('meta', property='og:image')
        poster_url = img_el.get('src') or img_el.get('content') or img_el.get('data-src') if img_el else None

        # استخراج سيرفرات المشاهدة أو التضمين
        video_url = None
        iframe_el = soup.find('iframe', src=re.compile(r'(embed|player|stream|watch|video)'))
        if iframe_el:
            video_url = iframe_el.get('src')
        else:
            # محاولة العثور على زر مشاهدة
            watch_btn = soup.find('a', href=re.compile(r'(watch|embed|stream)'))
            if watch_btn:
                video_url = watch_btn.get('href')

        # تحسين البيانات عبر TMDB
        tmdb_data = enrich_from_tmdb(title, media_type)
        
        # إنشاء معرف فريد مبني على الرابط أو TMDB
        item_id = tmdb_data.get('tmdb_id') if tmdb_data and tmdb_data.get('tmdb_id') else abs(hash(url)) % 10000000

        record = {
            "id": item_id,
            "title": title,
            "original_title": title,
            "overview": overview,
            "poster_path": (tmdb_data and tmdb_data.get('poster_path')) or poster_url or "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
            "backdrop_path": tmdb_data.get('backdrop_path') if tmdb_data else None,
            "media_type": media_type,
            "release_date": "2024",
            "vote_average": (tmdb_data and tmdb_data.get('vote_average')) or 8.2,
            "popularity": 999.0,
            "genres": ["عربي", "حركة", "دراما"],
            "original_language": "ar",
            "video_url": video_url or url
        }

        # حفظ في قاعدة بيانات Supabase
        supabase.table("media").upsert(record).execute()
        print(f"✨ تم الحفظ بنجاح: [{title}] | المعرف: {item_id}")
        return True

    except Exception as e:
        print(f"❌ حدث خطأ أثناء المعالجة: {e}")
        return False

def scrape_category_page(category_url, max_items=20, media_type='movie'):
    print(f"\n🚀 بدء سحب المحتوى من القسم: {category_url}\n")
    try:
        res = scraper.get(category_url, timeout=15)
        soup = BeautifulSoup(res.text, 'lxml')
        
        # جلب جميع روابط المقالات/الأفلام في الصفحة
        links = []
        for a in soup.find_all('a', href=True):
            href = a['href']
            if any(key in href for key in ['/movie/', '/film/', '/series/', '/post/', '/watch/']):
                if href not in links and href != category_url:
                    links.append(href)

        print(f"🎯 تم العثور على {len(links)} رابط عمل. جاري المعالجة حتى {max_items}...")
        
        count = 0
        for link in links[:max_items]:
            if parse_and_save_item(link, media_type):
                count += 1
            time.sleep(1) # حماية السيرفر

        print(f"\n🎉 انتهى السحب بنجاح! تم استخراج وحفظ {count} عمل في موقعك.\n")

    except Exception as err:
        print(f"❌ خطأ أثناء قراءة القسم: {err}")

if __name__ == '__main__':
    print("="*50)
    print("🎬 السكرابر الشامل للمواقع العربية - سينما بلاس 🎬")
    print("="*50)
    print("1) سحب رابط فيلم / مسلسل مفرد مباشر")
    print("2) سحب قسم كامل (أفلام عربية، مسلسلات، إلخ)")
    print("3) الخروج")
    print("="*50)
    
    opt = input("👉 اختر العملية (1-3): ").strip()
    
    if opt == '1':
        single_url = input("🌐 ضع رابط الفيلم أو الحلقة: ").strip()
        m_type = input("هل هو فيلم (movie) أم مسلسل (tv)؟ [افتراضي movie]: ").strip() or 'movie'
        parse_and_save_item(single_url, m_type)
    elif opt == '2':
        cat_url = input("🌐 ضع رابط القسم (Category URL): ").strip()
        lim = input("🔢 كم عدد الأعمال المطلوبة (افتراضي 20): ").strip()
        lim_num = int(lim) if lim.isdigit() else 20
        m_type = input("هل القسم أفلام (movie) أم مسلسلات (tv)؟ [افتراضي movie]: ").strip() or 'movie'
        scrape_category_page(cat_url, lim_num, m_type)
    else:
        print("تم الإلغاء.")
