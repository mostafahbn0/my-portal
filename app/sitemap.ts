import { MetadataRoute } from 'next'
import { supabaseServer } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = supabaseServer()
  const { data: media } = await supabase.from('media').select('slug, updated_at')

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const mediaEntries: MetadataRoute.Sitemap = (media || []).map((item) => ({
    url: `${baseUrl}/media/${item.slug}`,
    lastModified: new Date(item.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/series`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/anime`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/explore`, lastModified: new Date(), changeFrequency: 'always', priority: 0.7 },
    ...mediaEntries,
  ]
}
