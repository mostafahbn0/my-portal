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

def check_exists(tmdb_id):
    try:
        url = f"{SUPABASE_URL}/rest/v1/media?tmdb_id=eq.{tmdb_id}&select=id"
        res = requests.get(url, headers=HEADERS)
        return res.status_code == 200 and len(res.json()) > 0
    except Exception:
        return False

def add_media(item, media_type="movie"):
    tmdb_id = item.get('id')
    if check_exists(tmdb_id):
        return

    # جلب تفاصيل العمل الإنجليزية للحصول على الاسم الدقيق
    en_res = requests.get(f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}?api_key={TMDB_API_KEY}&language=en-US").json()
    ar_res = requests.get(f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}?api_key={TMDB_API_KEY}&language=ar").json()

    real_title = en_res.get('title') or en_res.get('name') or en_res.get('original_title') or en_res.get('original_name')
    arabic_title = ar_res.get('title') or ar_res.get('name') or real_title
    overview = ar_res.get('overview') or en_res.get('overview') or "مشاهدة وتحميل بأعلى جودة مع الترجمة العربية حصرياً على سينما بلاس."
    
    poster_path = en_res.get('poster_path')
    backdrop_path = en_res.get('backdrop_path') or poster_path
    if not poster_path:
        return

    release_date = en_res.get('release_date') or en_res.get('first_air_date') or '2024-01-01'
    year = release_date.split('-')[0]
    rating = float(en_res.get('vote_average') or 7.5)
    slug = create_slug(real_title, tmdb_id)

    payload = {
        "title": arabic_title,
        "original_title": real_title, # الاسم الحقيقي على البوستر
        "overview": overview,
        "poster_url": f"https://image.tmdb.org/t/p/w500{poster_path}",
        "backdrop_url": f"https://image.tmdb.org/t/p/original{backdrop_path}",
        "slug": slug,
        "tmdb_id": int(tmdb_id),
        "year": year,
        "release_date": release_date,
        "rating": rating,
        "vote_average": rating,
        "media_type": "movie" if media_type == "movie" else "series"
    }

    url = f"{SUPABASE_URL}/rest/v1/media"
    res = requests.post(url, headers=HEADERS, json=payload)
    if res.status_code in [200, 201]:
        print(f"  🎬 ✅ {real_title} ({year})")
    else:
        payload["tmdb_id"] = str(tmdb_id)
        res2 = requests.post(url, headers=HEADERS, json=payload)
        if res2.status_code in [200, 201]:
            print(f"  🎬 ✅ {real_title} ({year})")

print("="*60)
print("🚀 سحب أشهر وأحدث أفلام 2024 / 2025 الصادرة رسمياً...")
print("="*60)

# سحب أفلام 2024-2025 التي صدرت ولديها عدد تقييمات كافٍ (بمعنى تم عرضها بالفعل وتتوفر لها سيرفرات وترجمة)
movie_discover_url = f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&primary_release_date.gte=2024-01-01&primary_release_date.lte=2025-02-28&vote_count.gte=50&sort_by=popularity.desc"
m_res = requests.get(movie_discover_url).json()

for m in m_res.get('results', [])[:20]:
    add_media(m, media_type="movie")
    time.sleep(0.08)

print("\n" + "="*60)
print("📺 سحب أقوى مسلسلات 2024 / 2025 المتصدرة بالترجمة...")
print("="*60)

# سحب مسلسلات 2024-2025
tv_discover_url = f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&first_air_date.gte=2024-01-01&vote_count.gte=30&sort_by=popularity.desc"
t_res = requests.get(tv_discover_url).json()

for t in t_res.get('results', [])[:12]:
    add_media(t, media_type="tv")
    time.sleep(0.08)

print("\n" + "="*60)
print("🎉 مبروك! تم إضافة كل الأعمال الحديثة الحقيقية بنجاح تام!")
print("="*60)
