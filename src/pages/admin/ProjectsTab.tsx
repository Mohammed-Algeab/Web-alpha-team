// src/pages/admin/ProjectsTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ArrayInput } from './_shared';
import type { Project } from '@/types';

export function ProjectsTab({ projects }: { projects: Project[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Project>>({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ type: 'تعريب', status: 'active', progress: 0, latest_version: '1.0' });

  const startEdit = (p: Project) => { setEditing(p.id); setEditData({ ...p }); };

  const saveProject = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('projects').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
    setSaving(false);
  };

  const addProject = async () => {
    if (!newProject.id || !newProject.name) { alert('يرجى ملء المعرّف والاسم على الأقل'); return; }
    setSaving(true);
    const { error } = await supabase.from('projects').insert([newProject]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewProject({ type: 'تعريب', status: 'active', progress: 0, latest_version: '1.0' }); window.location.reload(); }
    setSaving(false);
  };

  const deleteProject = async (p: Project) => {
    const [{ count: postsCount }, { count: dlCount }] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('project_id', p.id),
      supabase.from('downloads').select('id', { count: 'exact', head: true }).eq('project_id', p.id),
    ]);
    const warnings: string[] = [];
    if (postsCount) warnings.push(`${postsCount} منشور سيُفصل عن المشروع`);
    if (dlCount) warnings.push(`${dlCount} تحميل سيُحذف نهائياً مع المشروع`);
    const message = warnings.length
      ? `تحذير بخصوص "${p.name}":\n\n${warnings.join('\n')}\n\nهل تريد المتابعة بالحذف؟`
      : `هل أنت متأكد من حذف "${p.name}"؟`;
    if (!confirm(message)) return;
    const { error } = await supabase.from('projects').delete().eq('id', p.id);
    if (error) alert('خطأ: ' + error.message); else window.location.reload();
  };

  const fields = (data: Partial<Project>, setData: (d: Partial<Project>) => void, isNew = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {isNew && (
        <div>
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>المعرّف (ID)</label>
          <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.id || ''} onChange={(e) => setData({ ...data, id: e.target.value })} placeholder="fate-stay-night" />
        </div>
      )}
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الاسم الفني (SEO)</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} /></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الاسم المعروض</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} /></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>النوع</label>
        <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.type || 'تعريب'} onChange={(e) => setData({ ...data, type: e.target.value as Project['type'] })}>
          <option value="تعريب">تعريب</option><option value="أداة">أداة</option><option value="لعبة">لعبة</option>
        </select></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الحالة</label>
        <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.status || 'active'} onChange={(e) => setData({ ...data, status: e.target.value as Project['status'] })}>
          <option value="active">جاري العمل</option><option value="completed">مكتمل</option>
          <option value="upcoming">قادم قريباً</option><option value="paused">متوقف</option>
        </select></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>التقدم (%)</label>
        <input type="number" min="0" max="100" className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.progress ?? 0} onChange={(e) => setData({ ...data, progress: parseInt(e.target.value) })} /></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الإصدار</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.latest_version || ''} onChange={(e) => setData({ ...data, latest_version: e.target.value })} /></div>
      <div><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>رابط التحميل</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.download_link || ''} onChange={(e) => setData({ ...data, download_link: e.target.value })} /></div>
      <div className="flex items-center gap-3">
        <label className="text-xs" style={{ color: 'var(--text-secondary)' }}>مميز:</label>
        <input type="checkbox" checked={data.featured || false} onChange={(e) => setData({ ...data, featured: e.target.checked })} className="w-4 h-4 accent-[var(--bronze)]" />
        {data.featured && (
          <div className="flex-1"><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>ترتيب العرض</label>
            <input type="number" min="0" className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={data.display_order ?? 0} onChange={(e) => setData({ ...data, display_order: parseInt(e.target.value) })} /></div>
        )}
      </div>
      <div className="md:col-span-2"><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>رابط صورة الغلاف</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.cover || ''} onChange={(e) => setData({ ...data, cover: e.target.value })} />
        {data.cover && <div className="mt-2 w-32 h-20 rounded overflow-hidden bronze-border-thin"><img src={data.cover} alt="معاينة" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.2'; }} /></div>}
      </div>
      {isNew && (
        <div className="md:col-span-2"><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>وصف المشروع</label>
          <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={3} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={data.description || ''} onChange={(e) => setData({ ...data, description: e.target.value })} /></div>
      )}
      <div className="md:col-span-2"><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>قصة الكفاح</label>
        <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={3} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.struggle_story || ''} onChange={(e) => setData({ ...data, struggle_story: e.target.value })} /></div>
      <div className="md:col-span-2"><label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>صور المشروع (روابط)</label>
        <ArrayInput values={data.images || []} onChange={(v) => setData({ ...data, images: v })} placeholder="رابط الصورة ثم Enter" /></div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>المشاريع</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm"><Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة مشروع'}</span></button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-6 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>مشروع جديد</h3>
          {fields(newProject, setNewProject, true)}
          <div className="flex gap-2">
            <button onClick={addProject} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span></button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {projects.map((p) => (
          <div key={p.id} className="bronze-border p-4" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === p.id ? (
              <div className="space-y-3">
                {fields(editData, setEditData)}
                <div className="flex gap-2">
                  <button onClick={() => saveProject(p.id)} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="font-bold" style={{ fontFamily: 'Cairo' }}>{p.title || p.name}</span>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(200, 168, 112, 0.15)', color: 'var(--bronze)' }}>{p.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(200, 168, 112, 0.15)', color: 'var(--bronze)' }}>{p.progress}%</span>
                    {p.featured && <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(200, 168, 112, 0.3)', color: 'var(--bronze)' }}>★ مميز</span>}
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: p.status === 'completed' ? 'rgba(112, 160, 80, 0.2)' : 'rgba(200, 168, 112, 0.15)', color: p.status === 'completed' ? 'var(--success)' : 'var(--bronze)' }}>{p.status}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Edit2 size={16} /></button>
                  <button onClick={() => deleteProject(p)} className="p-2 rounded-lg hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
