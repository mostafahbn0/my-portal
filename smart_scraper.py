import requests
import json
import time
import re

# --- الإعدادات ---
TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def get_columns():
    try:
        res = requests.get(f"{SUPABASE_URL}/rest/v1/media?limit=1", headers=HEADERS)
        if res.status_code == 200 and len(res.json()) > 0:
            return set(res.json()[0].keys())
    except: pass
    return set()

COLS = get_columns()
TYPE_COL = 'type' if 'type' in COLS else ('media_type' if 'media_type' in COLS else 'type')

def create_slug(title, tid):
    clean = re.sub(r'[^\w\s-]', '', str(title)).strip().lower()
    return f"{re.sub(r'[-\s]+', '-', clean)[:40]}-{tid}"

def check_exists(tid):
    res = requests.get(f"{SUPABASE_URL}/rest/v1/media?tmdb_id=eq.{tid}&select=id", headers=HEADERS)
    return res.status_code == 200 and len(res.json()) > 0

def save_item(item, mtype="movie"):
    tid = item.get('id')
    if check_exists(tid): return
    
    # جلب الاسم الإنجليزي الحقيقي
    en = requests.get(f"https://api.themoviedb.org/3/{'tv' if mtype=='tv' else 'movie'}/{tid}?api_key={TMDB_API_KEY}&language=en-US").json()
    ar = requests.get(f"https://api.themoviedb.org/3/{'tv' if mtype=='tv' else 'movie'}/{tid}?api_key={TMDB_API_KEY}&language=ar").json()
    
    title = en.get('title') or en.get('name') or ar.get('title')
    if en.get('original_language') == 'ar': title = ar.get('title') or title

    data = {
        "title": title,
        "overview": ar.get('overview') or en.get('overview'),
        "poster_url": f"https://image.tmdb.org/t/p/w500{en.get('poster_path')}",
        "backdrop_url": f"https://image.tmdb.org/t/p/original{en.get('backdrop_path') or en.get('poster_path')}",
        "tmdb_id": str(tid),
        "year": (en.get('release_date') or en.get('first_air_date') or '2024')[:4],
        "rating": round(en.get('vote_average', 7.5), 1),
        "slug": create_slug(title, tid),
        TYPE_COL: "movie" if mtype=="movie" else "series"
    }
    
    final_payload = {k: v for k, v in data.items() if k in COLS}
    requests.post(f"{SUPABASE_URL}/rest/v1/media", headers=HEADERS, json=final_payload)
    print(f"✅ تم إضافة: {title}")

def main():
    while True:
        print("\n🚀 أداة سحب سينما بلاس الشاملة")
        print("1. سحب أفلام التريند (السينما حالياً)")
        print("2. سحب مسلسلات التريند")
        print("3. سحب أنمي")
        print("0. خروج")
        c = input("أدخل اختيارك: ")
        
        if c == '1':
            r = requests.get(f"https://api.themoviedb.org/3/trending/movie/week?api_key={TMDB_API_KEY}").json()
            for i in r.get('results', []): save_item(i, "movie")
        elif c == '2':
            r = requests.get(f"https://api.themoviedb.org/3/trending/tv/week?api_key={TMDB_API_KEY}").json()
            for i in r.get('results', []): save_item(i, "tv")
        elif c == '3':
            r = requests.get(f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&with_genres=16&with_original_language=ja").json()
            for i in r.get('results', []): save_item(i, "tv")
        elif c == '0': break

if __name__ == "__main__": main()
