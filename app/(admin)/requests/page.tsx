'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Check, Trash2, Clock, CheckCircle2, Film } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

interface UserRequest {
  id: string
  title: string
  type: string
  user_note: string | null
  status: 'pending' | 'completed' | 'rejected'
  created_at: string
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')

  const fetchRequests = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setRequests(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const updateStatus = async (id: string, status: 'completed' | 'pending') => {
    await supabase.from('requests').update({ status }).eq('id', id)
    fetchRequests()
  }

  const deleteRequest = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return
    await supabase.from('requests').delete().eq('id', id)
    fetchRequests()
  }

  const filtered = requests.filter(r => {
    if (filter === 'all') return true
    return r.status === filter
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">طلبات المستخدمين</h1>
          <p className="text-sm text-slate-500">إدارة ومتابعة طلبات الأفلام والمسلسلات المرسلة من الزوار</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-sm font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
          >
            الكل ({requests.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'pending' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}
          >
            قيد الانتظار ({requests.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-lg transition-all ${filter === 'completed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
          >
            تمت إضافتها ({requests.filter(r => r.status === 'completed').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">جاري تحميل الطلبات...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>لا توجد طلبات في هذا القسم حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
                    {req.type === 'movie' ? '🎬 فيلم' : req.type === 'series' ? '📺 مسلسل' : '🎌 أنمي'}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                    req.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {req.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    <span>{req.status === 'completed' ? 'تمت الإضافة' : 'قيد الانتظار'}</span>
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-lg">{req.title}</h3>

                {req.user_note && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {req.user_note}
                  </p>
                )}
                
                <p className="text-[11px] text-slate-400">
                  {new Date(req.created_at).toLocaleDateString('ar-EG', { dateStyle: 'medium' })}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  href={`/media/add?title=${encodeURIComponent(req.title)}`}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-all"
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>إضافة للسينما</span>
                </Link>

                {req.status === 'pending' ? (
                  <button
                    onClick={() => updateStatus(req.id, 'completed')}
                    title="تحديد كمكتمل"
                    className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-all"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => updateStatus(req.id, 'pending')}
                    title="إعادة للانتظار"
                    className="p-2 text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all"
                  >
                    <Clock className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => deleteRequest(req.id)}
                  title="حذف الطلب"
                  className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
