import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://my-portal-nu-liart.vercel.app';

  // الصفحات الثابتة
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/explore?type=movie`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/explore?type=series`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/explore?type=anime`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // جلب كل الأعمال المسجلة في الداتابيز لإنشاء روابطها
  const { data: mediaItems } = await supabase
    .from('media')
    .select('id, updated_at, created_at')
    .limit(1000);

  const mediaRoutes: MetadataRoute.Sitemap = (mediaItems || []).map((item) => ({
    url: `${baseUrl}/watch/${item.id}`,
    lastModified: new Date(item.updated_at || item.created_at || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...mediaRoutes];
}
