import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { mediaId, serverName, issueType, details } = await req.json()
    if (!mediaId) {
      return NextResponse.json({ error: 'Missing mediaId' }, { status: 400 })
    }

    const supabase = supabaseServer()
    const { error } = await supabase.from('reports').insert({
      media_id: mediaId,
      server_name: serverName || 'Default',
      issue_type: issueType || 'server_down',
      details: details || 'بلاغ من صفحة المشاهدة',
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
