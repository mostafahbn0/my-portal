'use client';
import { useState } from 'react';
import { Search, Plus, Trash2, Save, Loader2, CheckCircle } from 'lucide-react';
import Image from 'next/image';

interface LinkInput { type: 'stream' | 'download'; server_name: string; url: string; quality: string; }

export default function AdminAddPage() {
  const [secret, setSecret] = useState('');
  const [auth, setAuth] = useState(false);
  const [tmdbId, setTmdbId] = useState('');
  const [mType, setMType] = useState<'movie' | 'tv'>('movie');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tmdb, setTmdb] = useState<any>(null);
  const [links, setLinks] = useState<LinkInput[]>([{ type: 'stream', server_name: '', url: '', quality: '1080p' }]);

  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">🔐 دخول الأدمن</h1>
        <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="كلمة السر..." className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
        <button onClick={() => setAuth(secret.length >= 4)} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition">دخول</button>
      </div>
    </div>
  );

  const fetchTMDB = async () => {
    if (!tmdbId) return;
    setLoading(true); setTmdb(null);
    try {
      const r = await fetch(`/api/tmdb/${tmdbId}?type=${mType}`, { headers: { 'x-admin-secret': secret } });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setTmdb(d);
    } catch (e: any) { alert('خطأ: ' + e.message); }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!tmdb) return;
    setSaving(true); setSaved(false);
    try {
      const slug = `${tmdb.title}-${tmdb.release_year}`.toLowerCase().replace(/[^\w\u0600-\u06FF\s-]/g, '').trim().replace(/\s+/g, '-');
      const r = await fetch('/api/admin/save', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret }, body: JSON.stringify({ tmdb_id: parseInt(tmdbId), type: mType === 'tv' ? 'series' : 'movie', slug, ...tmdb, links: links.filter((l) => l.url && l.server_name) }) });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSaved(true);
    } catch (e: any) { alert('خطأ: ' + e.message); }
    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-extrabold mb-8">➕ إضافة محتوى جديد</h1>
      <div className="bg-slate-900 rounded-2xl p-6 mb-6 space-y-4">
        <h2 className="text-lg font-bold">1️⃣ جلب من TMDB</h2>
        <div className="flex gap-3">
          <select value={mType} onChange={(e) => setMType(e.target.value as any)} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3"><option value="movie">فيلم</option><option value="tv">مسلسل/أنمي</option></select>
          <input type="number" value={tmdbId} onChange={(e) => setTmdbId(e.target.value)} placeholder="TMDB ID" className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
          <button onClick={fetchTMDB} disabled={loading} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-bold transition disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}جلب</button>
        </div>
        {tmdb && (
          <div className="flex gap-4 mt-4 p-4 bg-slate-800 rounded-xl animate-fade-in">
            {tmdb.poster_url && <Image src={tmdb.poster_url} alt={tmdb.title} width={120} height={180} className="rounded-lg object-cover" />}
            <div className="space-y-2"><h3 className="text-xl font-bold">{tmdb.title}</h3><p className="text-sm text-slate-400">السنة: {tmdb.release_year} | التقييم: ⭐ {tmdb.rating}</p><p className="text-sm text-slate-400">{tmdb.genres.join('، ')}</p><p className="text-xs text-slate-500 line-clamp-3">{tmdb.overview}</p></div>
          </div>
        )}
      </div>
      {tmdb && (
        <>
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between"><h2 className="text-lg font-bold">2️⃣ الروابط</h2><button onClick={() => setLinks([...links, { type: 'stream', server_name: '', url: '', quality: '1080p' }])} className="flex items-center gap-1 text-sm bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg"><Plus className="w-4 h-4" />إضافة</button></div>
            {links.map((l, i) => (
              <div key={i} className="flex flex-wrap gap-2 items-center bg-slate-800 p-3 rounded-xl">
                <select value={l.type} onChange={(e) => { const u = [...links]; u[i].type = e.target.value as any; setLinks(u); }} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"><option value="stream">مشاهدة</option><option value="download">تحميل</option></select>
                <input value={l.server_name} onChange={(e) => { const u = [...links]; u[i].server_name = e.target.value; setLinks(u); }} placeholder="السيرفر" className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm w-32" />
                <input value={l.url} onChange={(e) => { const u = [...links]; u[i].url = e.target.value; setLinks(u); }} placeholder="الرابط" className="flex-1 min-w-[200px] bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm" />
                <select value={l.quality} onChange={(e) => { const u = [...links]; u[i].quality = e.target.value; setLinks(u); }} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm"><option>2160p</option><option>1080p</option><option>720p</option><option>480p</option></select>
                <button onClick={() => setLinks(links.filter((_, x) => x !== i))} className="p-2 hover:bg-red-600/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition ${saved ? 'bg-green-600' : 'bg-gradient-to-l from-red-500 to-blue-600'} disabled:opacity-50`}>
            {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : saved ? <CheckCircle className="w-6 h-6" /> : <Save className="w-6 h-6" />}
            {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ! ✅' : 'حفظ'}
          </button>
        </>
      )}
    </div>
  );
}
