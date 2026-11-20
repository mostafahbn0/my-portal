import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''

    if (!q.trim()) {
      return NextResponse.json({ results: [] })
    }

    const supabase = supabaseServer()
    const { data, error } = await supabase
      .from('media')
      .select('id, title, title_ar, slug, type, poster_url, rating, release_year')
      .or(`title.ilike.%${q}%,title_ar.ilike.%${q}%`)
      .limit(8)

    if (error) throw error
    return NextResponse.json({ results: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
