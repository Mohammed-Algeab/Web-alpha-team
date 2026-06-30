// src/pages/admin/ChangelogsTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2, ArrowUpDown, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ChangelogItem, Project } from '@/types';

export function ChangelogsTab({ changelogs, projects }: { changelogs: ChangelogItem[]; projects: Project[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ChangelogItem>>({});
  const [editChangesText, setEditChangesText] = useState('');
  const [newLog, setNewLog] = useState<Partial<ChangelogItem>>({});
  const [changesText, setChangesText] = useState('');
  const [adding, setAdding] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  // المشاريع المطوية (افتراضياً كل المشاريع مطوية إلا أولها)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const startEdit = (log: ChangelogItem) => {
    setEditing(log.id);
    setEditData({ ...log });
    setEditChangesText((log.changes || []).join('\n'));
  };

  const saveChangelog = async (id: string) => {
    const changes = editChangesText.split('\n').filter((c) => c.trim());
    const { error } = await supabase.from('changelogs').update({ ...editData, changes }).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
  };

  const addChangelog = async () => {
    if (!newLog.project_id || !newLog.version) { alert('يرجى ملء المشروع والإصدار'); return; }
    const changes = changesText.split('\n').filter((c) => c.trim());
    const { error } = await supabase.from('changelogs').insert([{ ...newLog, changes }]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewLog({}); setChangesText(''); window.location.reload(); }
  };

  const deleteChangelog = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    const { error } = await supabase.from('changelogs').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  // تجميع الإصدارات حسب المشروع + فرز كل مجموعة بحسب التاريخ
  const groups = projects
    .map((p) => {
      const logs = changelogs
        .filter((c) => c.project_id === p.id)
        .sort((a, b) => {
          const diff = new Date(b.date).getTime() - new Date(a.date).getTime();
          return sortOrder === 'desc' ? diff : -diff;
        });
      return { project: p, logs };
    })
    .filter((g) => g.logs.length > 0);

  // سجلات بلا مشروع مطابق (مشروع محذوف مثلاً) — تُعرض في مجموعة خاصة لتجنب فقدانها من الواجهة
  const orphanLogs = changelogs.filter((c) => !projects.some((p) => p.id === c.project_id));

  const toggleCollapsed = (id: string) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>سجل الإصدارات</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
            className="btn-outline text-sm"
            title="فرز حسب التاريخ"
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
          </button>
          <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
            <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة'}</span>
          </button>
        </div>
      </div>

      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={newLog.project_id || ''} onChange={(e) => setNewLog({ ...newLog, project_id: e.target.value })}>
              <option value="">اختر المشروع</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
            </select>
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="رقم الإصدار" value={newLog.version || ''} onChange={(e) => setNewLog({ ...newLog, version: e.target.value })} />
            <input type="date" className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={newLog.date || ''} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} />
          </div>
          <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={4} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            placeholder="التغييرات (سطر لكل تغيير)" value={changesText} onChange={(e) => setChangesText(e.target.value)} />
          <button onClick={addChangelog} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
        </div>
      )}

      {groups.length === 0 && orphanLogs.length === 0 && (
        <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>لا توجد إصدارات مسجّلة بعد</p>
      )}

      <div className="space-y-3">
        {groups.map(({ project, logs }) => {
          const isCollapsed = collapsed[project.id] ?? false;
          return (
            <div key={project.id} className="bronze-border" style={{ backgroundColor: 'rgba(200, 168, 112, 0.02)' }}>
              <button
                onClick={() => toggleCollapsed(project.id)}
                className="w-full flex items-center justify-between p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ fontFamily: 'Cairo', color: 'var(--text)' }}>
                    {project.title || project.name}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--bronze)', color: 'var(--bg)' }}>
                    {logs.length}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  style={{ color: 'var(--bronze)', transform: isCollapsed ? 'rotate(-90deg)' : 'none', transition: 'transform 0.15s' }}
                />
              </button>

              {!isCollapsed && (
                <div className="px-3 pb-3 space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
                      {editing === log.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                              value={editData.project_id || ''} onChange={(e) => setEditData({ ...editData, project_id: e.target.value })}>
                              {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
                            </select>
                            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                              value={editData.version || ''} onChange={(e) => setEditData({ ...editData, version: e.target.value })} />
                            <input type="date" className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                              value={editData.date || ''} onChange={(e) => setEditData({ ...editData, date: e.target.value })} />
                          </div>
                          <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={4} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                            value={editChangesText} onChange={(e) => setEditChangesText(e.target.value)} placeholder="التغييرات (سطر لكل تغيير)" />
                          <div className="flex gap-2">
                            <button onClick={() => saveChangelog(log.id)} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                            <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bronze)', color: 'var(--bg)', fontFamily: 'Cairo' }}>v{log.version}</span>
                              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(log.date).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => startEdit(log)} className="p-1.5 rounded-lg hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Edit2 size={12} /></button>
                              <button onClick={() => deleteChangelog(log.id)} className="p-1.5 rounded-lg hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={12} /></button>
                            </div>
                          </div>
                          <ul className="mr-4">
                            {(log.changes || []).map((c, i) => (
                              <li key={i} className="text-sm" style={{ color: 'var(--text)' }}>* {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {orphanLogs.length > 0 && (
          <div className="bronze-border p-3" style={{ backgroundColor: 'rgba(220, 80, 60, 0.04)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--error)' }}>
              سجلات بدون مشروع مطابق (قد يكون المشروع محذوفاً) — {orphanLogs.length}
            </p>
            {orphanLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>v{log.version} · {log.project_id}</span>
                <button onClick={() => deleteChangelog(log.id)} className="p-1 rounded hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

