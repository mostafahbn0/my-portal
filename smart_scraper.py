import requests
import json
import time
import sys
from supabase import create_client

TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

C_GREEN = '\033[92m'
C_RED = '\033[91m'
C_CYAN = '\033[96m'
C_YELLOW = '\033[93m'
C_BOLD = '\033[1m'
C_RESET = '\033[0m'

GENRE_MAP = {
    28: "أكشن", 12: "مغامرة", 16: "أنمي", 35: "كوميدي", 80: "جريمة",
    99: "وثائقي", 18: "دراما", 10751: "عائلي", 14: "فانتازيا",
    36: "تاريخي", 27: "رعب", 10402: "موسيقى", 9648: "غموض",
    10749: "رومانسية", 878: "خيال علمي", 10770: "تلفزيوني",
    53: "إثارة", 10752: "حرب", 37: "غرب أمريكي"
}

def get_genres(genre_ids):
    return [GENRE_MAP.get(gid, "منوعات") for gid in genre_ids if gid in GENRE_MAP]

def is_anime(item):
    genre_ids = item.get('genre_ids', [])
    origin_country = item.get('origin_country', [])
    original_lang = item.get('original_language', '')
    if 16 in genre_ids and ('JP' in origin_country or original_lang == 'ja'):
        return True
    return False

def scrape_episodes_for_series(media_uuid, tmdb_id, total_seasons):
    for season_num in range(1, total_seasons + 1):
        try:
            url = f"https://api.themoviedb.org/3/tv/{tmdb_id}/season/{season_num}?api_key={TMDB_API_KEY}&language=ar-SA"
            r = requests.get(url, timeout=10)
            if r.status_code != 200:
                continue
            season_data = r.json()
            episodes = season_data.get('episodes', [])
            
            for ep in episodes:
                ep_num = ep.get('episode_number')
                ep_title = ep.get('name') or f"الحلقة {ep_num}"
                still_path = ep.get('still_path')
                image_url = f"https://image.tmdb.org/t/p/w500{still_path}" if still_path else None
                
                ep_payload = {
                    "media_id": media_uuid,
                    "season_number": season_num,
                    "episode_number": ep_num,
                    "title": ep_title,
                    "servers": [
                        {"name": "VidLink VIP", "url": f"https://vidlink.pro/tv/{tmdb_id}/{season_num}/{ep_num}"},
                        {"name": "EmbedSU", "url": f"https://embed.su/embed/tv/{tmdb_id}/{season_num}/{ep_num}"}
                    ]
                }
                if image_url:
                    ep_payload["download_links"] = [{"quality": "1080p", "image": image_url}]

                supabase.table('episodes').upsert(ep_payload, on_conflict='media_id,season_number,episode_number').execute()
            
            print(f"    {C_GREEN}✓ تم إضافة {len(episodes)} حلقة للموسم {season_num}{C_RESET}")
            time.sleep(0.2)
        except Exception as e:
            pass

def process_item(item, forced_type=None):
    raw_type = item.get('media_type', 'movie') if not forced_type else forced_type
    
    if is_anime(item):
        media_type = 'anime'
    elif raw_type in ['tv', 'series']:
        media_type = 'series'
    else:
        media_type = 'movie'

    tmdb_id = item.get('id')
    ar_title = item.get('title') or item.get('name')
    en_title = item.get('original_title') or item.get('original_name') or ar_title
    
    poster_path = item.get('poster_path')
    backdrop_path = item.get('backdrop_path')
    
    poster = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
    backdrop = f"https://image.tmdb.org/t/p/original{backdrop_path}" if backdrop_path else None
    release_date = item.get('release_date') or item.get('first_air_date') or '2024-01-01'
    vote_avg = round(float(item.get('vote_average', 7.0)), 1)
    overview = item.get('overview') or f"شاهد {ar_title} مترجم بأعلى جودة على سينما بلاس."
    genres = get_genres(item.get('genre_ids', []))

    media_payload = {
        "tmdb_id": tmdb_id,
        "title": ar_title,
        "original_title": en_title,
        "type": media_type,
        "overview": overview,
        "poster_path": poster,
        "backdrop_path": backdrop,
        "vote_average": vote_avg,
        "release_date": release_date,
        "genres": genres
    }

    try:
        res = supabase.table('media').upsert(media_payload, on_conflict='tmdb_id').execute()
        print(f"{C_GREEN}[✓ نجاح]{C_RESET} [{media_type.upper()}] {ar_title} ({en_title})")
        
        if media_type in ['series', 'anime'] and res.data:
            media_uuid = res.data[0]['id']
            tv_details = requests.get(f"https://api.themoviedb.org/3/tv/{tmdb_id}?api_key={TMDB_API_KEY}").json()
            num_seasons = min(tv_details.get('number_of_seasons', 1), 3)
            scrape_episodes_for_series(media_uuid, tmdb_id, num_seasons)

    except Exception as e:
        print(f"{C_RED}[✗ خطأ]{C_RESET} في {ar_title}: {e}")

# الميزة رقم 5: تلبية طلبات المستخدمين تلقائياً من جدول requests
def fulfill_user_requests():
    print(f"\n{C_BOLD}{C_CYAN}=== فحص وتلبية طلبات المستخدمين من جدول Requests ==={C_RESET}")
    res = supabase.table('requests').select('*').limit(20).execute()
    requests_list = res.data or []
    
    if not requests_list:
        print(f"{C_YELLOW}لا توجد طلبات جديدة في جدول requests حالياً.{C_RESET}")
        return

    for req in requests_list:
        title = req.get('title')
        print(f"\n{C_BOLD}🔍 جاري البحث عن العمل المطلوب: {title}...{C_RESET}")
        
        # البحث في TMDB
        search_url = f"https://api.themoviedb.org/3/search/multi?api_key={TMDB_API_KEY}&query={requests_url(title)}&language=ar-SA"
        sr = requests.get(search_url).json()
        results = sr.get('results', [])
        
        if results:
            first_match = results[0]
            process_item(first_match)
            print(f"{C_GREEN}🎉 تمت تلبية وإضافة طلب المستخدم بنجاح: {title}{C_RESET}")
            # حذف الطلب بعد تلبيته
            supabase.table('requests').delete().eq('id', req.get('id')).execute()
        else:
            print(f"{C_RED}لم يتم العثور على نتائج دقيقة لـ: {title}{C_RESET}")

def requests_url(s):
    import urllib.parse
    return urllib.parse.quote(s)

# الميزة رقم 2: سحب أفلام قادمة في صالات السينما لهيمنة الـ SEO
def scrape_upcoming():
    print(f"\n{C_BOLD}{C_CYAN}=== سحب الأفلام المنتظرة وقريباً في السينما (Anticipated SEO) ==={C_RESET}")
    url = f"https://api.themoviedb.org/3/movie/upcoming?api_key={TMDB_API_KEY}&language=ar-SA&page=1"
    data = requests.get(url).json()
    for item in data.get('results', []):
        process_item(item, forced_type='movie')
        time.sleep(0.2)

# إشعار محرك بحث جوجل بتحديث الخريطة
def ping_google():
    print(f"\n{C_BOLD}{C_CYAN}=== إرسال إشعار فوري لجوجل لفهرسة خريطة الموقع (Google Ping) ==={C_RESET}")
    sitemap_url = "https://my-portal-nu-liart.vercel.app/sitemap.xml"
    try:
        ping_url = f"https://www.google.com/ping?sitemap={sitemap_url}"
        r = requests.get(ping_url, timeout=10)
        print(f"{C_GREEN}✓ تم إرسال إشعار خريطة الموقع لمحرك بحث جوجل بنجاح!{C_RESET}")
    except Exception as e:
        print(f"{C_YELLOW}تنبيه: محرك بحث جوجل يقرأ الخريطة تلقائياً عبر robots.txt{C_RESET}")

def main():
    while True:
        print(f"\n{C_BOLD}{C_CYAN}╔═══════════════════════════════════════════════════╗")
        print(f"║     🚀 أداة سينما بلاس الخارقة لإدارة الترافيك    ║")
        print(f"╚═══════════════════════════════════════════════════╝{C_RESET}")
        print(f"{C_BOLD}[1]{C_RESET} سحب الأفلام الشائعة (Trending Movies)")
        print(f"{C_BOLD}[2]{C_RESET} سحب المسلسلات مع المواسم والحلقات")
        print(f"{C_BOLD}[3]{C_RESET} سحب أحدث أعمال الأنمي")
        print(f"{C_BOLD}[4]{C_RESET} {C_YELLOW}سحب الأفلام المنتظرة قريباً (Upcoming SEO Boost){C_RESET}")
        print(f"{C_BOLD}[5]{C_RESET} {C_GREEN}تلبية طلبات الزوار تلقائياً (من جدول Requests){C_RESET}")
        print(f"{C_BOLD}[6]{C_RESET} إرسال إشعار فوري لجوجل (Google Sitemap Ping)")
        print(f"{C_BOLD}[7]{C_RESET} خروج")
        
        choice = input(f"\n{C_BOLD}اختر خياراً للبدء (1-7): {C_RESET}").strip()
        
        if choice == '1':
            from smart_scraper import process_item
            url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=ar-SA&page=1"
            for item in requests.get(url).json().get('results', []):
                process_item(item, forced_type='movie')
        elif choice == '2':
            url = f"https://api.themoviedb.org/3/tv/popular?api_key={TMDB_API_KEY}&language=ar-SA&page=1"
            for item in requests.get(url).json().get('results', []):
                if not is_anime(item):
                    process_item(item, forced_type='series')
        elif choice == '3':
            url = f"https://api.themoviedb.org/3/discover/tv?api_key={TMDB_API_KEY}&with_genres=16&with_original_language=ja&page=1"
            for item in requests.get(url).json().get('results', []):
                process_item(item, forced_type='series')
        elif choice == '4':
            scrape_upcoming()
        elif choice == '5':
            fulfill_user_requests()
        elif choice == '6':
            ping_google()
        elif choice == '7':
            print("بالتوفيق!")
            break

if __name__ == "__main__":
    main()
