// src/pages/admin/DownloadsTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Download, Project, ChangelogItem } from '@/types';

export function DownloadsTab({ downloads, projects, changelogs }: { downloads: Download[]; projects: Project[]; changelogs: ChangelogItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Download>>({});
  const [newDl, setNewDl] = useState<Partial<Download>>({});
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  // فلترة القائمة الرئيسية بالمشروع — تحل مشكلة كل التحميلات تظهر مدمجة
  const [filterProject, setFilterProject] = useState<string>('');

  const startEdit = (d: Download) => { setEditing(d.id); setEditData({ ...d }); };

  const saveDownload = async (id: string) => {
    setSaving(true);
    // changelog كائن إضافي من الـ join فقط للعرض، لا عمود فعلي بالجدول — لا يُرسل للتحديث
    const { changelog: _omit, ...payload } = editData;
    const { error } = await supabase.from('downloads').update(payload).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
    setSaving(false);
  };

  const addDownload = async () => {
    if (!newDl.title || !newDl.link || !newDl.project_id || !newDl.changelog_id) {
      alert('يرجى ملء العنوان والرابط والمشروع، واختيار الإصدار من سجل الإصدارات'); return;
    }
    setSaving(true);
    const { changelog: _omit, ...payload } = newDl;
    const { error } = await supabase.from('downloads').insert([payload]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewDl({}); window.location.reload(); }
    setSaving(false);
  };

  const deleteDownload = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const { error } = await supabase.from('downloads').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  const dlFields = (data: Partial<Download>, setData: (d: Partial<Download>) => void) => {
    // إصدارات المشروع المختار فقط — الأحدث أولاً
    const projectChangelogs = changelogs
      .filter((c) => c.project_id === data.project_id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>العنوان</label>
          <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="اسم التحميل" />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>المشروع</label>
          <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.project_id || ''} onChange={(e) => setData({ ...data, project_id: e.target.value, changelog_id: undefined })}>
            <option value="">اختر المشروع</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الإصدار *</label>
          {!data.project_id ? (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>اختر المشروع أولاً لعرض إصداراته</p>
          ) : projectChangelogs.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--error)' }}>
              لا توجد إصدارات مسجّلة لهذا المشروع — يجب إضافة الإصدار من تبويب "الإصدارات" أولاً قبل ربط تحميل به
            </p>
          ) : (
            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={data.changelog_id || ''} onChange={(e) => setData({ ...data, changelog_id: e.target.value })}>
              <option value="">اختر الإصدار</option>
              {projectChangelogs.map((c) => (
                <option key={c.id} value={c.id}>v{c.version} — {new Date(c.date).toLocaleDateString('en-US')}</option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>رابط التحميل</label>
          <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.link || ''} onChange={(e) => setData({ ...data, link: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>اسم الملف</label>
          <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.filename || ''} onChange={(e) => setData({ ...data, filename: e.target.value })} placeholder="patch.zip" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>النوع</label>
            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={data.type || 'patch'} onChange={(e) => setData({ ...data, type: e.target.value })}>
              <option value="patch">Patch (تصحيح)</option>
              <option value="full">Full (كامل)</option>
              <option value="dlc">DLC (إضافة)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الحالة</label>
            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={data.status || 'stable'} onChange={(e) => setData({ ...data, status: e.target.value })}>
              <option value="stable">Stable (مستقر)</option>
              <option value="beta">Beta (تجريبي)</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>ملاحظات</label>
          <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={2} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.notes || ''} onChange={(e) => setData({ ...data, notes: e.target.value })} placeholder="ملاحظات إضافية..." />
        </div>
      </div>
    );
  };

  // فلترة بالمشروع + فرز بـ created_at (الأحدث أولاً) — يحل تضارب الفرز السابق
  const filteredDownloads = downloads
    .filter((d) => !filterProject || d.project_id === filterProject)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>التحميلات</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة'}</span>
        </button>
      </div>

      {/* فلترة بالمشروع */}
      <div className="mb-4 p-3 bronze-border" style={{ backgroundColor: 'rgba(200, 168, 112, 0.02)' }}>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>فلترة بالمشروع</label>
        <select className="w-full md:w-64 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
          <option value="">كل المشاريع ({downloads.length})</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title || p.name} ({downloads.filter((d) => d.project_id === p.id).length})</option>
          ))}
        </select>
      </div>

      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>تحميل جديد</h3>
          {dlFields(newDl, setNewDl)}
          <button onClick={addDownload} disabled={saving} className="btn-bronze text-sm">
            <Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span>
          </button>
        </div>
      )}
      <div className="space-y-2">
        {filteredDownloads.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>لا توجد تحميلات مطابقة للفلتر</p>
        )}
        {filteredDownloads.map((d) => (
          <div key={d.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === d.id ? (
              <div className="space-y-3">
                {dlFields(editData, setEditData)}
                <div className="flex gap-2">
                  <button onClick={() => saveDownload(d.id)} disabled={saving} className="btn-bronze text-sm">
                    <Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span>
                  </button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{d.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    v{d.changelog?.version || '?'} — {projects.find((p) => p.id === d.project_id)?.title || d.project_id}
                    {d.type && <span className="mx-1 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(200,168,112,0.15)', color: 'var(--bronze)' }}>{d.type}</span>}
                    {d.status && <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: d.status === 'stable' ? 'rgba(112,160,80,0.2)' : 'rgba(200,168,112,0.15)', color: d.status === 'stable' ? 'var(--success)' : 'var(--bronze)' }}>{d.status}</span>}
                    {d.filename && <span className="mr-1">— {d.filename}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(d)} className="p-2 rounded-lg hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Edit2 size={14} /></button>
                  <button onClick={() => deleteDownload(d.id)} className="p-2 rounded-lg hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

