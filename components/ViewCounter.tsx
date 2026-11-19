'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ViewCounter({ mediaId }: { mediaId: string }) {
  useEffect(() => {
    if (!mediaId) return

    async function incrementViews() {
      try {
        const { data } = await supabase
          .from('media')
          .select('views')
          .eq('id', mediaId)
          .single()

        if (data) {
          await supabase
            .from('media')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', mediaId)
        }
      } catch (err) {
        // تجاهل أي خطأ صامتاً حتى لا يؤثر على تجربة الزائر
      }
    }

    incrementViews()
  }, [mediaId])

  return null
}
