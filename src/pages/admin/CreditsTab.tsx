// src/pages/admin/CreditsTab.tsx
import { useState, useEffect } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types';
interface CreditItem { id: string; name: string; role: string; project_id: string | null; }

export function CreditsTab({ projects }: { projects: Project[] }) {
  const [credits, setCredits] = useState<CreditItem[]>([]);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CreditItem>>({});
  const [newItem, setNewItem] = useState<Partial<CreditItem>>({});
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('credits').select('*').then(({ data }) => {
      setCredits((data || []) as CreditItem[]);
      setLoadingCredits(false);
    });
  }, []);

  const startEdit = (item: CreditItem) => { setEditing(item.id); setEditData({ ...item }); };

  const saveItem = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('credits').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else {
      setCredits(credits.map(c => c.id === id ? { ...c, ...editData } as CreditItem : c));
      setEditing(null);
    }
    setSaving(false);
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.role) { alert('يرجى ملء الاسم والدور'); return; }
    setSaving(true);
    const { data, error } = await supabase.from('credits').insert([newItem]).select().single();
    if (error) alert('خطأ: ' + error.message);
    else { setCredits([...credits, data as CreditItem]); setAdding(false); setNewItem({}); }
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const { error } = await supabase.from('credits').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else setCredits(credits.filter(c => c.id !== id));
  };

  const creditFields = (data: Partial<CreditItem>, setData: (d: Partial<CreditItem>) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الاسم</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.name || ''} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="اسم الشخص أو الجهة" />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الدور</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.role || ''} onChange={(e) => setData({ ...data, role: e.target.value })} placeholder="المترجم، المدقق..." />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>المشروع (اختياري)</label>
        <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.project_id || ''} onChange={(e) => setData({ ...data, project_id: e.target.value || null })}>
          <option value="">عام</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
        </select>
      </div>
    </div>
  );

  if (loadingCredits) return <p style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>الشكر والتقدير</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة'}</span>
        </button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          {creditFields(newItem, setNewItem)}
          <div className="flex gap-2">
            <button onClick={addItem} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span></button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {credits.map((item) => (
          <div key={item.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === item.id ? (
              <div className="space-y-3">
                {creditFields(editData, setEditData)}
                <div className="flex gap-2">
                  <button onClick={() => saveItem(item.id)} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{item.name}</span>
                  <span className="text-xs mx-2" style={{ color: 'var(--text-secondary)' }}>—</span>
                  <span className="text-sm" style={{ color: 'var(--bronze)' }}>{item.role}</span>
                  {item.project_id && (
                    <span className="text-xs mr-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(200,168,112,0.15)', color: 'var(--bronze)' }}>
                      {projects.find(p => p.id === item.project_id)?.title || item.project_id}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Edit2 size={14} /></button>
                  <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

