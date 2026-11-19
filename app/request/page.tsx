'use client'

import { useState } from 'react'
import { Send, CheckCircle2, AlertCircle, Film, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function RequestPage() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'movie',
    user_note: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: insertError } = await supabase.from('requests').insert([
        {
          title: formData.title,
          type: formData.type,
          user_note: formData.user_note,
          status: 'pending'
        }
      ])

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({ title: '', type: 'movie', user_note: '' })
    } catch {
      setError('حدث خطأ أثناء إرسال طلبك. حاول مجدداً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 max-w-2xl py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-inner">
            <Film className="w-8 h-8" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">طلب فيلم أو مسلسل</h1>
          <p className="text-slate-400 text-sm">
            مش لاقي عملك المفضل على سينما بلس؟ اطلبه الآن وسيقوم فريق العمل بتوفيره في أسرع وقت.
          </p>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">تم استلام طلبك بنجاح! سنقوم بمراجعته وإضافته قريباً.</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">اسم الفيلم أو المسلسل *</label>
            <input
              type="text"
              required
              placeholder="مثال: Inception أو مسلسل قيامة عثمان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">نوع العمل</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'movie', label: 'فيلم' },
                { id: 'series', label: 'مسلسل' },
                { id: 'anime', label: 'أنمي' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: item.id })}
                  className={`py-2.5 px-4 rounded-xl border text-sm font-bold transition-all ${
                    formData.type === item.id
                      ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-2">ملاحظات إضافية (سنة الإنتاج أو الموسم)</label>
            <textarea
              rows={3}
              placeholder="مثال: إنتاج 2023 بجودة عالية مع الترجمة..."
              value={formData.user_note}
              onChange={(e) => setFormData({ ...formData, user_note: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>إرسال الطلب الآن</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
