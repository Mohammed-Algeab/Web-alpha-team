// src/pages/admin/DashboardStatsTab.tsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TopViewedItem {
  content_type: string;
  content_id: string;
  views: number;
  title: string;
}

export function DashboardStatsTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [logs, setLogs] = useState<Array<{ id: string; admin_email: string; action: string; target_table?: string; created_at?: string }>>([]);
  const [topViewed, setTopViewed] = useState<TopViewedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadTopViewed();
    if (isSuperAdmin) loadLogs();
  }, [isSuperAdmin]);

  async function loadStats() {
    // dashboard_stats is a VIEW returning a single aggregate row — no id column
    const { data, error } = await supabase.from('dashboard_stats').select('*').limit(1).single();
    if (!error && data) {
      const s: Record<string, number> = {};
      Object.entries(data).forEach(([k, v]) => { if (typeof v === 'number') s[k] = v; });
      setStats(s);
    }
    setLoading(false);
  }

  // §5.3: أكثر 5 عناصر مشاهدة (آخر 30 يوم) — تجميع بسيط من جدول page_views الخام
  async function loadTopViewed() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const { data: views, error } = await supabase
      .from('page_views')
      .select('content_type, content_id')
      .gte('viewed_at', since.toISOString().split('T')[0]);
    if (error || !views) return;

    const counts = new Map<string, { content_type: string; content_id: string; views: number }>();
    for (const v of views) {
      const key = `${v.content_type}:${v.content_id}`;
      const entry = counts.get(key);
      if (entry) entry.views += 1;
      else counts.set(key, { content_type: v.content_type, content_id: v.content_id, views: 1 });
    }
    const top = [...counts.values()].sort((a, b) => b.views - a.views).slice(0, 5);
    if (top.length === 0) { setTopViewed([]); return; }

    // جلب العناوين — استعلامان فقط (projects/posts) بدل استعلام منفصل لكل عنصر
    const projectIds = top.filter((t) => t.content_type === 'project').map((t) => t.content_id);
    const postIds = top.filter((t) => t.content_type === 'post').map((t) => t.content_id);
    const [{ data: projectRows }, { data: postRows }] = await Promise.all([
      projectIds.length ? supabase.from('projects').select('id, title, name').in('id', projectIds) : Promise.resolve({ data: [] as { id: string; title?: string; name?: string }[] }),
      postIds.length ? supabase.from('posts').select('id, title').in('id', postIds) : Promise.resolve({ data: [] as { id: string; title?: string }[] }),
    ]);
    const titleMap = new Map<string, string>();
    (projectRows || []).forEach((p) => titleMap.set(`project:${p.id}`, p.title || p.name || p.id));
    (postRows || []).forEach((p) => titleMap.set(`post:${p.id}`, p.title || p.id));

    setTopViewed(
      top.map((t) => ({
        ...t,
        title: titleMap.get(`${t.content_type}:${t.content_id}`) || t.content_id,
      }))
    );
  }

  async function loadLogs() {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error) setLogs(data || []);
  }

  const statCards = [
    { key: 'total_projects', label: 'المشاريع', color: 'var(--bronze)' },
    { key: 'active_projects', label: 'النشطة', color: '#6090C0' },
    { key: 'completed_projects', label: 'المكتملة', color: 'var(--success)' },
    { key: 'total_posts', label: 'المنشورات', color: 'var(--bronze)' },
    { key: 'total_downloads', label: 'التحميلات', color: '#6090C0' },
    { key: 'glossary_terms', label: 'المصطلحات', color: 'var(--bronze)' },
    { key: 'active_admins', label: 'المشرفون النشطون', color: 'var(--success)' },
    { key: 'logs_24h', label: 'العمليات (24س)', color: '#6090C0' },
  ];

  if (loading) return <p style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>إحصائيات اللوحة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statCards.map(({ key, label, color }) => (
            <div key={key} className="bronze-border p-4 text-center" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
              <div className="text-2xl font-bold" style={{ color, fontFamily: 'Cairo' }}>{stats[key] ?? 0}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* §5.3: الأكثر مشاهدة (آخر 30 يوم) — مشاهدات فريدة فقط، لا تكرار لنفس الجهاز/اليوم */}
      <div>
        <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>الأكثر مشاهدة (٣٠ يوم)</h2>
        {topViewed.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>لا توجد بيانات مشاهدات بعد</p>
        ) : (
          <div className="space-y-2">
            {topViewed.map((item) => (
              <div key={`${item.content_type}:${item.content_id}`} className="bronze-border p-3 text-sm flex items-center justify-between" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(200,168,112,0.15)', color: 'var(--bronze)' }}>
                    {item.content_type === 'project' ? 'مشروع' : item.content_type === 'post' ? 'منشور' : item.content_type}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.title}</span>
                </div>
                <span className="font-bold" style={{ color: 'var(--bronze)' }}>{item.views} مشاهدة</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isSuperAdmin && (
        <div>
          <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>سجل العمليات الأخيرة</h2>
          {logs.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>لا توجد عمليات مسجلة بعد</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bronze-border p-3 text-sm" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold" style={{ color: 'var(--bronze)' }}>{log.admin_email}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(200,168,112,0.15)', color: 'var(--bronze)' }}>{log.action}</span>
                    {log.target_table && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{log.target_table}</span>}
                    <span className="text-xs mr-auto" style={{ color: 'var(--text-secondary)' }}>
                      {log.created_at ? new Date(log.created_at).toLocaleString('en-US') : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

