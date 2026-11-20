import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id
    const apiKey = process.env.TMDB_API_KEY
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=ar-SA`)
    const data = await res.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
