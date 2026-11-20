import requests
import json
import time
import re

# --- إعدادات الاتصال ---
TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# دالة اكتشاف أعمدة الجدول تلقائياً
def get_actual_columns():
    try:
        res = requests.get(f"{SUPABASE_URL}/rest/v1/media?limit=1", headers=HEADERS)
        if res.status_code == 200 and len(res.json()) > 0:
            return set(res.json()[0].keys())
    except: pass
    return set()

COLS = get_actual_columns()
TYPE_COL = 'type' if 'type' in COLS else ('media_type' if 'media_type' in COLS else None)

def create_slug(title, tid):
    clean = re.sub(r'[^\w\s-]', '', str(title)).strip().lower()
    clean = re.sub(r'[-\s]+', '-', clean)
    return f"{clean[:40]}-{tid}"

def check_exists(tid):
    res = requests.get(f"{SUPABASE_URL}/rest/v1/media?tmdb_id=eq.{tid}&select=id", headers=HEADERS)
    return res.status_code == 200 and len(res.json()) > 0

def save_media(item, mtype="movie"):
    tid = item.get('id')
    if not tid or check_exists(tid): return False

    endpoint = 'tv' if mtype == 'tv' else 'movie'
    # جلب التفاصيل بالإنجليزية للاسم العالمي
    en = requests.get(f"https://api.themoviedb.org/3/{endpoint}/{tid}?api_key={TMDB_API_KEY}&language=en-US").json()
    ar = requests.get(f"https://api.themoviedb.org/3/{endpoint}/{tid}?api_key={TMDB_API_KEY}&language=ar").json()

    title = en.get('title') or en.get('name') or ar.get('title')
    if en.get('original_language') == 'ar':
        title = ar.get('title') or ar.get('name') or title

    poster = en.get('poster_path')
    if not poster: return False

    date = en.get('release_date') or en.get('first_air_date') or '2024-01-01'
    rating = round(float(en.get('vote_average') or 7.0), 1)

    # تجهيز كل الحقول الممكنة
    full_data = {
        "title": title,
        "original_title": en.get('title') or en.get('name'),
        "overview": ar.get('overview') or en.get('overview') or "مشاهدة وتحميل حصرياً على سينما بلاس.",
        "poster_url": f"https://image.tmdb.org/t/p/w500{poster}",
        "backdrop_url": f"https://image.tmdb.org/t/p/original{en.get('backdrop_path') or poster}",
        "tmdb_id": str(tid),
        "year": date[:4],
        "release_date": date,
        "rating": rating,
        "vote_average": rating,
        "slug": create_slug(title, tid),
        "category": "أفلام" if mtype == "movie" else "مسلسلات",
        "genre": "أكشن / إثارة"
    }
    
    if TYPE_COL:
        full_data[TYPE_COL] = "series" if mtype == "tv" else "movie"

    # الفلترة بناءً على الأعمدة الموجودة في قاعدة بياناتك فقط
    payload = {k: v for k, v in full_data.items() if k in COLS}
    
    # محاولة الإرسال
    res = requests.post(f"{SUPABASE_URL}/rest/v1/media", headers=HEADERS, json=payload)
    if res.status_code in [200, 201]:
        print(f"  🎬 ✅ تم إضافة: {title}")
        return True
    return False

def menu():
    while True:
        print("\n" + "="*50)
        print("🍿🚀 أداة سينما بلاس الذكية (Smart Scraper V4)")
        print("="*50)
        print(" [1] 🎬 سحب أفلام التريند (Trending Movies)")
        print(" [2] 📺 سحب مسلسلات التريند (TV Shows)")
        print(" [3] ⚔️ سحب أنمي ياباني (Anime Hub)")
        print(" [4] 🇪🇬 سحب أفلام عربية ومصرية حديثة")
        print(" [5] ⏳ سحب أفلام قريباً (Upcoming 2025)")
        print(" [0] 🚪 خروج")
        print("="*50)
        
        choice = input("👉 اختار رقم العملية: ")
        
        if choice == '1':
            r = requests.get(f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=ar").json()
            for i in r.get('results', []): save_media(i, "movie")
        elif choice == '2':
            r = requests.get(f"https://api.themoviedb.org/3/tv/popular?api_key={TMDB_API_KEY}&language=ar").json()
            for i in r.get('results', []): save_media(i, "tv")
        elif choice == '3':
            r = requests.get(f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&with_genres=16&with_original_language=ja").json()
            for i in r.get('results', []): save_media(i, "tv")
        elif choice == '4':
            r = requests.get(f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&with_original_language=ar&sort_by=popularity.desc").json()
            for i in r.get('results', []): save_media(i, "movie")
        elif choice == '5':
            r = requests.get(f"https://api.themoviedb.org/3/movie/upcoming?api_key={TMDB_API_KEY}&language=ar").json()
            for i in r.get('results', []): save_media(i, "movie")
        elif choice == '0':
            break

if __name__ == '__main__':
    menu()
