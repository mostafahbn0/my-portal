import os
import sys
import time
import requests
from supabase import create_client, Client

def load_env():
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

env = load_env()
TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = env.get("NEXT_PUBLIC_SUPABASE_URL", "https://pcgwfnevqoowerjeyhgk.supabase.co")
SUPABASE_KEY = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ تم الاتصال بقاعدة بيانات سينما بلاس")
except Exception as e:
    print(f"❌ خطأ: {e}")
    sys.exit(1)

def get_cast(media_type, tmdb_id):
    try:
        url = f"https://api.themoviedb.org/3/{media_type}/{tmdb_id}/credits?api_key={TMDB_API_KEY}&language=ar"
        res = requests.get(url, timeout=5).json()
        return [c['name'] for c in res.get('cast', [])[:5]]
    except Exception:
        return ["نجوم العمل"]

def insert_tmdb_item(item, media_type, custom_video=None, custom_servers=None):
    try:
        tmdb_id = item.get('id')
        title = item.get('title') if media_type == 'movie' else item.get('name')
        orig_title = item.get('original_title') if media_type == 'movie' else item.get('original_name')
        overview = item.get('overview') or "مشاهدة العمل بدقة عالية مع ترجمة عربية مدمجة وسيرفرات سريعة."
        poster = f"https://image.tmdb.org/t/p/w500{item['poster_path']}" if item.get('poster_path') else None
        backdrop = f"https://image.tmdb.org/t/p/original{item['backdrop_path']}" if item.get('backdrop_path') else poster
        release_date = (item.get('release_date') if media_type == 'movie' else item.get('first_air_date', '2024')) or '2024'
        rating = round(item.get('vote_average', 8.5), 1)

        if not poster:
            return False

        cast = get_cast(media_type, tmdb_id)

        record = {
            "id": tmdb_id,
            "title": title,
            "original_title": orig_title,
            "overview": overview,
            "poster_path": poster,
            "backdrop_path": backdrop,
            "media_type": media_type,
            "release_date": str(release_date)[:4],
            "vote_average": rating if rating > 0 else 8.5,
            "popularity": item.get('popularity', 100),
            "genres": ["سينما بلاس VIP", "حصري"],
            "original_language": item.get('original_language', 'en'),
            "video_url": custom_video,
            "video_servers": custom_servers or [],
            "cast_list": cast
        }

        supabase.table("media").upsert(record).execute()
        print(f"✨ تم النشر: [{title}] | سنة: {record['release_date']} | النجوم: {', '.join(cast[:2])}")
        return True
    except Exception as e:
        print(f"❌ خطأ: {e}")
        return False

def fetch_category(category, max_pages=3):
    print(f"\n🚀 جاري جلب محتوى [{category}] أوتوماتيكياً من خوادم TMDB...\n")
    total = 0
    for page in range(1, max_pages + 1):
        try:
            if category == 'movies':
                url = f"https://api.themoviedb.org/3/discover/movie?api_key={TMDB_API_KEY}&language=ar&sort_by=popularity.desc&page={page}&without_genres=16"
                mtype = 'movie'
            elif category == 'series':
                url = f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&language=ar&sort_by=popularity.desc&page={page}&without_genres=16"
                mtype = 'tv'
            elif category == 'anime':
                url = f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&language=ar&sort_by=popularity.desc&page={page}&with_genres=16&with_original_language=ja"
                mtype = 'tv'
            
            res = requests.get(url, timeout=10).json()
            for it in res.get('results', []):
                if insert_tmdb_item(it, mtype):
                    total += 1
                time.sleep(0.1)
        except Exception as e:
            print(f"خطأ في الصفحة {page}: {e}")

    print(f"\n🎉 تم الانتهاء بنجاح! تم إضافة {total} عمل عالي الجودة بنسبة 100%.\n")

def add_arabic_movie_manually():
    print("\n🎬 إضافة فيلم مصري / عربي (ببيانات TMDB الرسمية وسيرفر نظيف) 🎬")
    name = input("🔍 اكتب اسم الفيلم العربي للبحث عنه (مثال: ولاد رزق 3): ").strip()
    if not name:
        return

    url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={requests.utils.quote(name)}&language=ar"
    res = requests.get(url, timeout=10).json()
    results = res.get('results', [])

    if not results:
        print("❌ لم يتم العثور على الفيلم في قاعدة بيانات TMDB.")
        return

    print("\n🎯 النتائج المطابقة:")
    for idx, r in enumerate(results[:5]):
        print(f"{idx + 1}) {r.get('title')} ({r.get('release_date', '')[:4]})")

    pick = input("👉 اختر رقم الفيلم (1-5): ").strip()
    sel_idx = int(pick) - 1 if pick.isdigit() and 1 <= int(pick) <= len(results) else 0
    item = results[sel_idx]

    video_url = input("🌐 الصق رابط سيرفر المشاهدة المباشر (مثل Vidmoly أو Uqload أو غيره): ").strip()
    
    servers = []
    if video_url:
        servers.append({"name": "سيرفر المصدر الأصلي (HD)", "url": video_url})

    insert_tmdb_item(item, 'movie', custom_video=video_url, custom_servers=servers)
    print("🎉 تم نشر الفيلم العربي بالبوستر الرسمي والتفاصيل الكاملة!\n")

if __name__ == '__main__':
    print("="*50)
    print("🎬 محرك سينما بلاس الهجين المطور (Cinema Engine Pro) 🎬")
    print("="*50)
    print("1) جلب أحدث وأقوى أفلام هوليوود (سيرفرات تلقائية)")
    print("2) جلب مسلسلات نتفليكس والمسلسلات العالمية")
    print("3) جلب باقة من أقوى مسلسلات الأنمي الياباني")
    print("4) إضافة فيلم عربي/مصري ببيانات TMDB وسيرفر نظيف")
    print("5) الخروج")
    print("="*50)

    opt = input("👉 اختر من (1-5): ").strip()

    if opt == '1':
        p = input("📄 كم عدد الصفحات المطلوبة؟ (كل صفحة 20 فيلم، افتراضي 3): ").strip()
        fetch_category('movies', int(p) if p.isdigit() else 3)
    elif opt == '2':
        p = input("📄 كم عدد الصفحات المطلوبة؟ (افتراضي 3): ").strip()
        fetch_category('series', int(p) if p.isdigit() else 3)
    elif opt == '3':
        p = input("📄 كم عدد الصفحات المطلوبة؟ (افتراضي 2): ").strip()
        fetch_category('anime', int(p) if p.isdigit() else 2)
    elif opt == '4':
        add_arabic_movie_manually()
    else:
        print("تم الإلغاء.")
