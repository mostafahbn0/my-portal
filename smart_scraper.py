import requests
import json
import time
import re

TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def create_slug(title, item_id):
    clean = re.sub(r'[^\w\s-]', '', str(title)).strip().lower()
    clean = re.sub(r'[-\s]+', '-', clean)
    if not clean:
        clean = f"media-{item_id}"
    return f"{clean}-{item_id}"

# جلب أسماء الأعمدة الفعلية من أول سجل موجود في الجدول
def detect_columns():
    try:
        res = requests.get(f"{SUPABASE_URL}/rest/v1/media?limit=1", headers=HEADERS)
        if res.status_code == 200 and len(res.json()) > 0:
            cols = set(res.json()[0].keys())
            return cols
    except Exception:
        pass
    return set()

ACTUAL_COLS = detect_columns()
print("="*60)
print(f"🔍 الأعمدة الحقيقية للجدول: {list(ACTUAL_COLS) if ACTUAL_COLS else 'سيتم الاكتشاف التلقائي'}")
print("="*60)

def check_exists(tmdb_id):
    try:
        url = f"{SUPABASE_URL}/rest/v1/media?tmdb_id=eq.{tmdb_id}&select=id"
        res = requests.get(url, headers=HEADERS)
        return res.status_code == 200 and len(res.json()) > 0
    except Exception:
        return False

def save_media(raw_item, media_type="movie"):
    tmdb_id = raw_item.get('id')
    if check_exists(tmdb_id):
        return True

    title = raw_item.get('title') or raw_item.get('name') or raw_item.get('original_title') or 'بدون عنوان'
    original_title = raw_item.get('original_title') or raw_item.get('original_name') or title
    overview = raw_item.get('overview') or "مشاهدة وتحميل بأعلى جودة حصرياً على سينما بلاس."
    
    poster_path = raw_item.get('poster_path')
    backdrop_path = raw_item.get('backdrop_path') or poster_path
    if not poster_path:
        return False
        
    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
    backdrop_url = f"https://image.tmdb.org/t/p/original{backdrop_path}"
    
    release_date = raw_item.get('release_date') or raw_item.get('first_air_date') or '2024-01-01'
    year = release_date.split('-')[0]
    rating = float(raw_item.get('vote_average') or 7.5)
    slug = create_slug(original_title or title, tmdb_id)

    # تجهيز كائن البيانات بكل الاحتمالات الممكنة
    candidate_payload = {
        "title": title,
        "original_title": original_title,
        "overview": overview,
        "poster_url": poster_url,
        "backdrop_url": backdrop_url,
        "poster_path": poster_path,
        "backdrop_path": backdrop_path,
        "slug": slug,
        "tmdb_id": int(tmdb_id) if str(tmdb_id).isdigit() else tmdb_id,
        "type": media_type,
        "media_type": media_type,
        "year": year,
        "release_date": release_date,
        "rating": rating,
        "vote_average": rating,
        "genre": "أكشن / إثارة"
    }

    # إذا كانت الأعمدة معروفة، نقتصر عليها
    if ACTUAL_COLS:
        payload = {k: v for k, v in candidate_payload.items() if k in ACTUAL_COLS}
        # التأكد من وجود slug
        if "slug" in ACTUAL_COLS or "slug" not in payload:
            payload["slug"] = slug
    else:
        payload = candidate_payload.copy()

    url = f"{SUPABASE_URL}/rest/v1/media"
    
    # حلقة تكرارية ذكية لحذف أي عمود يسبب مشكلة وإعادة المحاولة فوراً
    while True:
        res = requests.post(url, headers=HEADERS, json=payload)
        if res.status_code in [200, 201]:
            print(f"  🎬 ✅ تم إضافة: {title} ({year})")
            return True
        
        err_text = res.text
        # استخراج اسم العمود غير المدعوم وحذفه
        match = re.search(r"Could not find the '(.+?)' column", err_text) or re.search(r"column \"(.+?)\" of", err_text)
        if match:
            bad_col = match.group(1)
            if bad_col in payload:
                del payload[bad_col]
                continue
        
        # محاولة بالصيغة النصية لـ tmdb_id لو كان السبب نوع البيانات
        if "tmdb_id" in payload and isinstance(payload["tmdb_id"], int):
            payload["tmdb_id"] = str(tmdb_id)
            continue

        print(f"  ❌ خطأ في {title}: {err_text}")
        return False

def scrape_arabic():
    print("\n🇪🇬 1. جاري سحب أحدث الأفلام العربية والمصرية:")
    res = requests.get(f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&with_original_language=ar&sort_by=popularity.desc&language=ar").json()
    for item in res.get('results', [])[:10]:
        save_media(item, media_type="movie")
        time.sleep(0.05)

def scrape_trending_movies():
    print("\n🔥 2. جاري سحب أفلام هوليوود والتريند العالمي:")
    res = requests.get(f"https://api.themoviedb.org/3/trending/movie/week?api_key={TMDB_API_KEY}&language=ar").json()
    for item in res.get('results', [])[:15]:
        save_media(item, media_type="movie")
        time.sleep(0.05)

def scrape_trending_series():
    print("\n📺 3. جاري سحب المسلسلات والأنمي:")
    res = requests.get(f"https://api.themoviedb.org/3/trending/tv/week?api_key={TMDB_API_KEY}&language=ar").json()
    for item in res.get('results', [])[:10]:
        save_media(item, media_type="tv")
        time.sleep(0.05)

def main():
    print("🚀 بدء التغذية الشاملة لقاعدة بيانات سينما بلاس...")
    scrape_arabic()
    scrape_trending_movies()
    scrape_trending_series()
    print("\n" + "="*60)
    print("🎉 مبروك يا بطل! تم إضافة الأفلام والمسلسلات بنجاح تام!")
    print("🌐 شيك على الموقع دلوقتي: https://my-portal-nu-liart.vercel.app")
    print("="*60)

if __name__ == '__main__':
    main()
