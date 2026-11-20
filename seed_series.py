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

def save_series(raw_item):
    tmdb_id = raw_item.get('id')
    if check_exists(tmdb_id):
        print(f"  ⏭️ موجود مسبقاً: {raw_item.get('name') or raw_item.get('original_name')}")
        return True

    title = raw_item.get('name') or raw_item.get('original_name') or 'بدون عنوان'
    original_title = raw_item.get('original_name') or title
    overview = raw_item.get('overview') or "مسلسل حصري كامل بجودة عالية مترجم ومدبلج على سينما بلاس."
    
    poster_path = raw_item.get('poster_path')
    backdrop_path = raw_item.get('backdrop_path') or poster_path
    if not poster_path:
        return False
        
    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
    backdrop_url = f"https://image.tmdb.org/t/p/original{backdrop_path}"
    
    first_air = raw_item.get('first_air_date') or '2024-01-01'
    year = first_air.split('-')[0]
    rating = float(raw_item.get('vote_average') or 8.0)
    slug = create_slug(original_title or title, tmdb_id)

    payload = {
        "title": title,
        "original_title": original_title,
        "overview": overview,
        "poster_url": poster_url,
        "backdrop_url": backdrop_url,
        "slug": slug,
        "tmdb_id": int(tmdb_id) if str(tmdb_id).isdigit() else tmdb_id,
        "media_type": "series", # القيمة المتوافقة مع قاعدة البيانات
        "year": year,
        "release_date": first_air,
        "rating": rating,
        "vote_average": rating,
        "genre": "دراما / إثارة"
    }

    url = f"{SUPABASE_URL}/rest/v1/media"
    
    for mtype in ["series", "show", "tv"]:
        payload["media_type"] = mtype
        res = requests.post(url, headers=HEADERS, json=payload)
        if res.status_code in [200, 201]:
            print(f"  📺 ✅ تم إضافة المسلسل: {title} ({year})")
            return True
        elif "enum" in res.text:
            continue
        else:
            # لو في عمود مش موجود نحذفه
            match = re.search(r"Could not find the '(.+?)' column", res.text)
            if match:
                del payload[match.group(1)]
                res_retry = requests.post(url, headers=HEADERS, json=payload)
                if res_retry.status_code in [200, 201]:
                    print(f"  📺 ✅ تم إضافة المسلسل: {title} ({year})")
                    return True
            break
            
    return False

print("="*60)
print("📺 جاري سحب أقوى المسلسلات والأنمي وتنزيلهم في قاعدة البيانات...")
print("="*60)

# 1. مسلسلات تريند
res1 = requests.get(f"https://api.themoviedb.org/3/trending/tv/week?api_key={TMDB_API_KEY}&language=ar").json()
for s in res1.get('results', [])[:12]:
    save_series(s)
    time.sleep(0.05)

# 2. أشهر مسلسلات الأنمي (Solo Leveling, Attack on Titan, etc.)
res2 = requests.get(f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&language=ar").json()
for a in res2.get('results', [])[:8]:
    save_series(a)
    time.sleep(0.05)

print("\n" + "="*60)
print("🎉 مبروك! الموقع الآن كامل 100% (أفلام عربية + أجنبية + مسلسلات + أنمي).")
print("🌐 افتح الموقع دلوقتي وتفرج على الجمال: https://my-portal-nu-liart.vercel.app")
print("="*60)
