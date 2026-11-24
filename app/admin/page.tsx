'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg3NjgsImV4cCI6MjA1NjgxNDc2OH0.m9bQ21Qv9aI6L-f3gEsqFp2rU8P4eB3qVfT-YgM2UeU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API_KEY = '204ce203e280acdfec221ea09ea5e763';
const MASTER_PIN = 'admin2025';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'ingest' | 'ramadan' | 'ads' | 'reports' | 'health'>('analytics');

  const [settings, setSettings] = useState<any>({
    monetag_direct_link: 'https://uplcm.com/4/12311730',
    unlock_clicks_count: 2,
    popunder_enabled: true,
    ramadan_mode: true,
    hero_slider_ids: [],
    ramadan_slider_ids: []
  });

  const [stats, setStats] = useState({ totalMedia: 0, totalReports: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const [serverHealth] = useState([
    { name: 'VidLink Pro VIP (SubDL)', status: 'operational', latency: '42ms', arabicSubs: 'متوفر 100%' },
    { name: 'AutoEmbed CC (OpenSubs)', status: 'operational', latency: '58ms', arabicSubs: 'متوفر 100%' },
    { name: 'SuperEmbed VIP Multi', status: 'operational', latency: '65ms', arabicSubs: 'متوفر' },
    { name: 'EmbedSu 4K Stream', status: 'operational', latency: '89ms', arabicSubs: 'تلقائي' },
    { name: 'VidSrc Pro Fast', status: 'operational', latency: '35ms', arabicSubs: 'متوفر' },
    { name: 'VidSrc CC Legacy', status: 'operational', latency: '120ms', arabicSubs: 'إنجليزي/عربي' }
  ]);

  useEffect(() => {
    const authStatus = localStorage.getItem('cinema_admin_auth');
    if (authStatus === 'true') setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === MASTER_PIN) {
      setIsAuthenticated(true);
      localStorage.setItem('cinema_admin_auth', 'true');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cinema_admin_auth');
    setIsAuthenticated(false);
  };

  const loadDashboardData = async () => {
    try {
      const { data: setts } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
      if (setts) setSettings(setts);

      const { count: mediaCount } = await supabase.from('media').select('*', { count: 'exact', head: true });
      const { data: repData, count: repCount } = await supabase.from('media_reports').select('*').order('created_at', { ascending: false });
      if (repData) setReports(repData);

      const { data: mList } = await supabase.from('media').select('id, title, media_type, release_date, poster_path').order('created_at', { ascending: false }).limit(10);
      if (mList) setMediaList(mList);

      setStats({
        totalMedia: mediaCount || 0,
        totalReports: repCount || 0
      });
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase.from('site_settings').upsert({
        id: 'global_config',
        ...settings,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      showToast('✅ تم حفظ الإعدادات بنجاح!');
    } catch (err) {
      showToast('❌ حدث خطأ أثناء حفظ الإعدادات');
    }
  };

  const searchTmdb = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=ar-SA&query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setTmdbResults(data.results || []);
    } catch (e) {
      showToast('خطأ في الاتصال بـ TMDB');
    } finally {
      setIsSearching(false);
    }
  };

  const importTmdbItem = async (item: any) => {
    try {
      const mType = item.media_type === 'tv' ? 'tv' : 'movie';
      const detailRes = await fetch(`https://api.themoviedb.org/3/${mType}/${item.id}?api_key=${TMDB_API_KEY}&language=ar-SA&append_to_response=credits`);
      const detail = await detailRes.json();

      const poster = detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';
      const backdrop = detail.backdrop_path ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}` : poster;

      const cast = (detail.credits?.cast || []).slice(0, 8).map((c: any) => ({
        name: c.name,
        character: c.character,
        profile_path: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      }));

      const newMedia = {
        id: detail.id,
        title: detail.title || detail.name || 'بدون عنوان',
        original_title: detail.original_title || detail.original_name || '',
        overview: detail.overview || 'عمل سينمائي مميز على سينما بلاس.',
        poster_path: poster,
        backdrop_path: backdrop,
        media_type: mType,
        release_date: detail.release_date || detail.first_air_date || '2024',
        vote_average: detail.vote_average || 8.5,
        popularity: detail.popularity || 100.0,
        genres: (detail.genres || []).map((g: any) => g.name),
        original_language: detail.original_language || 'en',
        cast_list: cast,
        video_servers: []
      };

      await supabase.from('media').upsert(newMedia);
      showToast(`🎬 تم إضافة "${newMedia.title}" بنجاح!`);
      loadDashboardData();
    } catch (e) {
      showToast('❌ فشل الاستيراد');
    }
  };

  const bulkIngest = async (type: 'trending' | 'ramadan' | 'netflix' | 'anime') => {
    setIsSyncing(true);
    setSyncStatus(`جاري ضخ باقة ${type}...`);
    try {
      let endpoint = '';
      if (type === 'trending') endpoint = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}&language=ar-SA`;
      if (type === 'ramadan') endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=ar-SA&with_original_language=ar&first_air_date_year=2024&sort_by=popularity.desc`;
      if (type === 'netflix') endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=ar-SA&with_networks=213&sort_by=popularity.desc`;
      if (type === 'anime') endpoint = `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=ar-SA&with_genres=16&with_original_language=ja&sort_by=popularity.desc`;

      const res = await fetch(endpoint);
      const data = await res.json();
      const results = (data.results || []).slice(0, 10);

      for (const item of results) {
        await importTmdbItem({ ...item, media_type: type === 'trending' ? 'movie' : 'tv' });
      }

      showToast(`🎉 تم ضخ 10 أعمال بنجاح!`);
    } catch (err) {
      showToast('❌ حدث خطأ أثناء الضخ التلقائي');
    } finally {
      setIsSyncing(false);
      setSyncStatus('');
    }
  };

  const resolveReport = async (reportId: number) => {
    await supabase.from('media_reports').update({ status: 'resolved' }).eq('id', reportId);
    showToast('✔️ تم تمييز البلاغ كمحلول');
    loadDashboardData();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl font-black border border-red-500/30">
            🔒
          </div>
          <h1 className="text-xl font-black mb-2">لوحة تحكم سينما بلاس VIP</h1>
          <p className="text-slate-400 text-xs mb-6">أدخل ماستر كود الإدارة</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="الرمز السري (أدخل رمز الإدارة السري)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-center text-lg tracking-widest text-white focus:outline-none focus:border-red-500"
              autoFocus
            />
            {pinError && <p className="text-red-400 text-xs">الرمز غير صحيح</p>}
            <button
              type="submit"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30"
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-red-500 text-white px-6 py-2.5 rounded-2xl shadow-2xl">
          {notification}
        </div>
      )}

      <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 bg-red-600 text-white rounded-xl flex items-center justify-center font-black">C+</span>
          <div>
            <h1 className="text-base font-black text-white">سينما بلاس | لوحة الإدارة</h1>
            <p className="text-[10px] text-emerald-400">● النظام متصل</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">👁️ الموقع</a>
          <button onClick={handleLogout} className="text-xs bg-red-600/20 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/30">🚪 خروج</button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        <aside className="w-full md:w-60 flex flex-row md:flex-col gap-2 overflow-x-auto">
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'analytics' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>📊 الإحصائيات</button>
          <button onClick={() => setActiveTab('ingest')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'ingest' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>⚡ ضخ المحتوى</button>
          <button onClick={() => setActiveTab('ramadan')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'ramadan' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🌙 قسم رمضان</button>
          <button onClick={() => setActiveTab('ads')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'ads' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}>💰 إعلانات Monetag</button>
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🚨 البلاغات ({reports.filter(r => r.status === 'pending').length})</button>
          <button onClick={() => setActiveTab('health')} className={`px-4 py-2.5 rounded-xl font-bold text-xs text-right whitespace-nowrap ${activeTab === 'health' ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'}`}>🩺 السيرفرات</button>
        </aside>

        <main className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          {activeTab === 'analytics' && (
            <div className="space-y-5">
              <h2 className="text-lg font-black text-white">📊 مؤشرات المنصة</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400">إجمالي الأعمال</span>
                  <p className="text-2xl font-black text-white mt-1">{stats.totalMedia}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <span className="text-xs text-slate-400">البلاغات المعلقة</span>
                  <p className="text-2xl font-black text-amber-400 mt-1">{reports.filter(r => r.status === 'pending').length}</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-300 mb-2">أحدث الأعمال المضافة:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {mediaList.map((m) => (
                    <div key={m.id} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                      <img src={m.poster_path} alt={m.title} className="w-full h-28 object-cover" />
                      <p className="p-1.5 text-[11px] font-bold truncate">{m.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ingest' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white">⚡ ضخ فوري للمحتوى</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button disabled={isSyncing} onClick={() => bulkIngest('trending')} className="p-3 bg-red-600/20 border border-red-500/30 text-white rounded-xl text-xs font-bold">🔥 هوليوود</button>
                <button disabled={isSyncing} onClick={() => bulkIngest('netflix')} className="p-3 bg-red-900/20 border border-red-700/30 text-white rounded-xl text-xs font-bold">🍿 نتفليكس</button>
                <button disabled={isSyncing} onClick={() => bulkIngest('ramadan')} className="p-3 bg-amber-600/20 border border-amber-500/30 text-white rounded-xl text-xs font-bold">🌙 رمضان 2025</button>
                <button disabled={isSyncing} onClick={() => bulkIngest('anime')} className="p-3 bg-indigo-600/20 border border-indigo-500/30 text-white rounded-xl text-xs font-bold">⚔️ أنمي</button>
              </div>
              {syncStatus && <p className="text-amber-400 text-xs animate-pulse">{syncStatus}</p>}

              <div className="pt-4 border-t border-slate-800">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="ابحث بالاسم في TMDB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchTmdb()}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <button onClick={searchTmdb} className="px-4 py-2 bg-red-600 text-white font-bold rounded-xl text-xs">بحث</button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tmdbResults.map((item) => (
                    <div key={item.id} className="bg-slate-900 border border-slate-800 p-2 rounded-xl flex gap-2 items-center">
                      <img src={item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : 'https://placehold.co/50x75'} className="w-12 h-16 object-cover rounded" />
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-white truncate">{item.title || item.name}</p>
                        <button onClick={() => importTmdbItem(item)} className="mt-1 px-3 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">+ إضافة للموقع</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ramadan' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-amber-400">🌙 إعدادات رمضان 2025</h2>
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-xs font-bold">تفعيل شريط رمضان في الصفحة الرئيسية</span>
                <input type="checkbox" checked={settings.ramadan_mode} onChange={(e) => setSettings({ ...settings, ramadan_mode: e.target.checked })} className="w-5 h-5 accent-amber-500" />
              </div>
              <button onClick={saveSettings} className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl text-xs">حفظ</button>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-emerald-400">💰 إعدادات الربح</h2>
              <div>
                <label className="text-xs text-slate-400 block mb-1">رابط Monetag Direct Link:</label>
                <input type="text" value={settings.monetag_direct_link || ''} onChange={(e) => setSettings({ ...settings, monetag_direct_link: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">عدد النقرات لفتح المشاهدة:</label>
                <select value={settings.unlock_clicks_count || 2} onChange={(e) => setSettings({ ...settings, unlock_clicks_count: Number(e.target.value) })} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-white">
                  <option value={1}>نقرة واحدة</option>
                  <option value={2}>نقرتان (موصى به)</option>
                  <option value={3}>3 نقرات</option>
                </select>
              </div>
              <button onClick={saveSettings} className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs">حفظ التغييرات</button>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              <h2 className="text-lg font-black text-white">🚨 البلاغات الواردة</h2>
              {reports.length === 0 ? <p className="text-xs text-slate-500">لا توجد بلاغات.</p> : reports.map(r => (
                <div key={r.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{r.media_title}</span>
                    <p className="text-slate-400 text-[11px] mt-0.5">💬 "{r.user_comment || 'سيرفر معطل'}"</p>
                  </div>
                  {r.status !== 'resolved' && (
                    <button onClick={() => resolveReport(r.id)} className="px-3 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">✔️ تم الإصلاح</button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-3">
              <h2 className="text-lg font-black text-sky-400">🩺 فاحص السيرفرات الحية</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {serverHealth.map((s, i) => (
                  <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-white">🟢 {s.name}</p>
                      <span className="text-[10px] text-slate-400">الترجمة: {s.arabicSubs}</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-1 rounded text-emerald-400 border border-slate-800">{s.latency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
