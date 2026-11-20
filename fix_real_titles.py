import requests
import json
import time

TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

# 1. اكتشاف الأعمدة الحقيقية
def get_cols():
    res = requests.get(f"{SUPABASE_URL}/rest/v1/media?limit=1", headers=HEADERS)
    if res.status_code == 200 and len(res.json()) > 0:
        return res.json()[0].keys()
    return []

cols = get_cols()
type_col = 'type' if 'type' in cols else ('media_type' if 'media_type' in cols else None)
print(f"🔍 تم اكتشاف الأعمدة. عمود النوع هو: {type_col}")

# 2. جلب البيانات للتحديث
res = requests.get(f"{SUPABASE_URL}/rest/v1/media?select=id,tmdb_id,title" + (f",{type_col}" if type_col else ""), headers=HEADERS)
items = res.json()

updated = 0
for item in items:
    tid = item.get('tmdb_id')
    curr_title = item.get('title')
    mid = item.get('id')
    
    # تحديد هل هو فيلم أم مسلسل
    m_type = item.get(type_col) if type_col else 'movie'
    endpoint = 'tv' if str(m_type).lower() in ['tv', 'series', 'show'] else 'movie'

    if not tid: continue

    # جلب الاسم العالمي من TMDB
    try:
        tmdb = requests.get(f"https://api.themoviedb.org/3/{endpoint}/{tid}?api_key={TMDB_API_KEY}&language=en-US").json()
        real_title = tmdb.get('title') or tmdb.get('name') or tmdb.get('original_title')
        
        if tmdb.get('original_language') == 'ar':
            real_title = tmdb.get('title') or curr_title

        if real_title and real_title != curr_title:
            patch_data = {"title": real_title}
            if 'slug' in cols:
                patch_data["slug"] = f"{real_title.lower().replace(' ', '-')[:40]}-{tid}"
            
            requests.patch(f"{SUPABASE_URL}/rest/v1/media?id=eq.{mid}", headers=HEADERS, json=patch_data)
            print(f"✅ {curr_title} -> {real_title}")
            updated += 1
    except: pass
    time.sleep(0.05)

print(f"\n✨ تم تحديث {updated} عمل بالأسماء الحقيقية!")
