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

print("="*60)
print("🔄 جاري جلب كل الأفلام والمسلسلات لتحديث أسمائها للأسماء الحقيقية...")
print("="*60)

res = requests.get(f"{SUPABASE_URL}/rest/v1/media?select=id,tmdb_id,title,media_type", headers=HEADERS)
if res.status_code != 200:
    print("❌ فشل في جلب البيانات من Supabase:", res.text)
    exit()

items = res.json()
print(f"📦 تم العثور على {len(items)} عمل في قاعدة البيانات. جاري التحديث الآن...")

updated_count = 0
for item in items:
    tmdb_id = item.get('tmdb_id')
    current_title = item.get('title')
    media_id = item.get('id')
    m_type = item.get('media_type') or 'movie'
    tmdb_endpoint = 'tv' if m_type in ['tv', 'series'] else 'movie'

    if not tmdb_id:
        continue

    # استدعاء TMDB باللغة الإنجليزية لجلب الاسم الحقيقي
    url = f"https://api.themoviedb.org/3/{tmdb_endpoint}/{tmdb_id}?api_key={TMDB_API_KEY}&language=en-US"
    tmdb_res = requests.get(url).json()

    real_title = tmdb_res.get('title') or tmdb_res.get('name') or tmdb_res.get('original_title') or tmdb_res.get('original_name')

    # لو فيلم عربي نخليه الاسم العربي أو فرانكو/إنجليزي نظيف
    if tmdb_res.get('original_language') == 'ar':
        real_title = tmdb_res.get('title') or current_title

    if real_title and real_title != current_title:
        # تحديث العنوان في Supabase مباشرة
        patch_url = f"{SUPABASE_URL}/rest/v1/media?id=eq.{media_id}"
        patch_payload = {
            "title": real_title,
            "slug": f"{real_title.lower().replace(' ', '-')[:40]}-{tmdb_id}"
        }
        patch_res = requests.patch(patch_url, headers=HEADERS, json=patch_payload)
        if patch_res.status_code in [200, 204]:
            print(f"  ✨ تم التعديل: {current_title} ➔ 🎬 {real_title}")
            updated_count += 1
        time.sleep(0.05)

print("\n" + "="*60)
print(f"🎉 تم تحديث {updated_count} فيلم ومسلسل بالاسم الإنجليزي الحقيقي بنجاح!")
print("="*60)
