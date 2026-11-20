import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { getMediaPoster, getMediaBackdrop, getMediaYear } from '@/lib/utils';

type Props = {
  params: { id: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!media) {
    return {
      title: 'سينما بلاس | مشاهدة وتحميل أحدث الأفلام والمسلسلات',
    };
  }

  const title = media.title || media.name;
  const year = getMediaYear(media);
  const typeText = media.type === 'movie' ? 'فيلم' : media.type === 'anime' ? 'أنمي' : 'مسلسل';
  const pageTitle = `مشاهدة ${typeText} ${title} (${year}) مترجم كامل HD | سينما بلاس`;
  const desc = media.overview ? `${media.overview.slice(0, 160)}...` : `شاهد وحمل ${typeText} ${title} مترجم بأعلى دقة على سينما بلاس بدون إعلانات مزعجة.`;
  const poster = getMediaPoster(media);

  return {
    title: pageTitle,
    description: desc,
    openGraph: {
      title: pageTitle,
      description: desc,
      url: `https://my-portal-nu-liart.vercel.app/watch/${media.id}`,
      siteName: 'سينما بلاس',
      images: [
        {
          url: poster,
          width: 800,
          height: 1200,
          alt: title,
        },
      ],
      locale: 'ar_AR',
      type: 'video.movie',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: desc,
      images: [poster],
    },
  };
}

export default async function WatchLayout({ params, children }: Props) {
  // جلب بيانات العمل لإنشاء Schema.org Rich Snippet لجوجل
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('id', params.id)
    .single();

  const jsonLd = media ? {
    "@context": "https://schema.org",
    "@type": media.type === 'movie' ? "Movie" : "TVSeries",
    "name": media.title,
    "alternateName": media.original_title,
    "image": getMediaPoster(media),
    "datePublished": media.release_date,
    "description": media.overview,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": media.vote_average || "7.5",
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": "1250"
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
