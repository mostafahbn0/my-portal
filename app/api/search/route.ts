import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get('q')?.trim();
  if (!q) return NextResponse.json({ results: [] });
  const { data, error } = await supabaseServer.from('media').select('id,slug,title,poster_url,release_year,type,rating,genres').or(`title.ilike.%${q}%,title_ar.ilike.%${q}%`).limit(20);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data });
}
