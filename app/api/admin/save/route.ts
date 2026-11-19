import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
export async function POST(req: Request) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { data: media, error } = await supabaseAdmin.from('media').upsert({
      tmdb_id: body.tmdb_id, type: body.type, slug: body.slug, title: body.title,
      overview: body.overview, poster_url: body.poster_url, backdrop_url: body.backdrop_url,
      release_year: body.release_year, rating: body.rating, genres: body.genres,
    }, { onConflict: 'tmdb_id' }).select().single();
    if (error) throw error;
    if (body.links?.length) {
      const { error: le } = await supabaseAdmin.from('links').insert(body.links.map((l: any) => ({ media_id: media.id, type: l.type, server_name: l.server_name, url: l.url, quality: l.quality })));
      if (le) throw le;
    }
    return NextResponse.json({ success: true, media });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
