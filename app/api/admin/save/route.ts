import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const supabase = supabaseServer()
    const { data, error } = await supabase.from('media').upsert(body).select().single()
    if (error) throw error
    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
