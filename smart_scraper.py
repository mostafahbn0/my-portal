import requests
from supabase import create_client
import time

TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763"
SUPABASE_URL = "https://pcgwfnevqoowerjeyhgk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NjM0NTcsImV4cCI6MjExMDUzOTQ1N30.nC0Ok2zqXNDZoBUe47kaQGPCTp7i28wYMMBdtFO33Xo"

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_genres(genre_ids):
    # قائمة مختصرة للتصنيفات
    genre_map = {28:"أكشن", 35:"كوميدي", 18:"دراما", 27:"رعب", 10749:"رومانسية", 878:"خيال علمي", 16:"أنمي"}
    return [genre_map.get(gid, "أخرى") for gid in genre_ids]

def scrape_trending():
    url = f"https://api.themoviedb.org/3/trending/all/day?api_key={TMDB_API_KEY}&language=ar-SA"
    r = requests.get(url).json()
    
    for item in r.get('results', []):
        media_type = item.get('media_type', 'movie')
        title = item.get('title') or item.get('name')
        
        # تخزين الرابط الكامل للصورة
        poster = f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}" if item.get('poster_path') else None
        backdrop = f"https://image.tmdb.org/t/p/original{item.get('backdrop_path')}" if item.get('backdrop_path') else None
        
        data = {
            "tmdb_id": item.get('id'),
            "title": title,
            "type": media_type,
            "overview": item.get('overview'),
            "poster_path": poster,
            "backdrop_path": backdrop,
            "vote_average": item.get('vote_average'),
            "release_date": item.get('release_date') or item.get('first_air_date'),
            "genres": get_genres(item.get('genre_ids', []))
        }
        
        try:
            supabase.table('media').upsert(data, on_conflict='tmdb_id').execute()
            print(f"تم بنجاح: {title}")
        except Exception as e:
            print(f"خطأ في {title}: {e}")

if __name__ == "__main__":
    scrape_trending()
