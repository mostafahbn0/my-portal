import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const supabase = supabaseServer()

    // استدعاء دالة RPC أو جلب عشوائي
    let query = supabase.from('media').select('slug')
    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query

    if (error || !data || data.length === 0) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const randomItem = data[Math.floor(Math.random() * data.length)]
    return NextResponse.redirect(new URL(`/media/${randomItem.slug}`, request.url))
  } catch {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
