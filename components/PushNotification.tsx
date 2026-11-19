'use client'
import { useState } from 'react'
import { Bell, Check } from 'lucide-react'

export default function PushNotification({ mediaId, mediaTitle }: { mediaId: string; mediaTitle: string }) {
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = () => {
    setSubscribed(true)
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition ${
        subscribed
          ? 'bg-green-600/20 text-green-400 border-green-500/30'
          : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
      }`}
    >
      {subscribed ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span>سيصلك إشعار فور نزول الحلقات</span>
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 text-amber-400" />
          <span>تفعيل إشعارات الحلقات الجديدة</span>
        </>
      )}
    </button>
  )
}
