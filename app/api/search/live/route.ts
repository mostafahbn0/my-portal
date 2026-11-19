import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  
  if (!q.trim() || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const supabase = supabaseServer()
  const cleanQ = q.trim()

  const { data, error } = await supabase
    .from('media')
    .select('id, title, title_ar, slug, type, poster_url, rating, release_year, quality')
    .or(`title.ilike.%${cleanQ}%,title_ar.ilike.%${cleanQ}%`)
    .limit(6)

  if (error) {
    return NextResponse.json({ results: [] })
  }

  return NextResponse.json({ results: data || [] })
}
