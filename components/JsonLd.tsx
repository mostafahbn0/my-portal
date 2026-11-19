interface JsonLdProps {
  media: {
    title: string
    title_ar?: string | null
    description?: string | null
    poster_url?: string | null
    release_year?: number | null
    rating?: number | null
    type: 'movie' | 'series' | 'anime'
    slug: string
  }
}

export default function JsonLd({ media }: JsonLdProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': media.type === 'movie' ? 'Movie' : 'TVSeries',
    name: media.title_ar || media.title,
    alternateName: media.title,
    description: media.description || '',
    image: media.poster_url || '',
    datePublished: media.release_year ? `${media.release_year}-01-01` : undefined,
    aggregateRating: media.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: media.rating,
          bestRating: '10',
          worstRating: '1',
          ratingCount: 150
        }
      : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}
