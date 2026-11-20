import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://my-portal-nu-liart.vercel.app';

  // جلب كل معرفات الأفلام من قاعدة البيانات
  const { data: movies } = await supabase.from('media').select('id');

  const movieEntries = (movies || []).map((m) => ({
    url: `${baseUrl}/watch/${m.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    ...movieEntries,
  ];
}
