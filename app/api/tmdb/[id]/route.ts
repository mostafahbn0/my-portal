import { NextResponse } from 'next/server';
import { fetchFromTMDB } from '@/lib/tmdb';
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const type = (new URL(req.url).searchParams.get('type') || 'movie') as 'movie' | 'tv';
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try { return NextResponse.json(await fetchFromTMDB(parseInt(params.id), type)); }
  catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
