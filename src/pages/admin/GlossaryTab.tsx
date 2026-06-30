// src/pages/admin/GlossaryTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { GlossaryItem, Project } from '@/types';

export function GlossaryTab({ glossary, projects }: { glossary: GlossaryItem[]; projects: Project[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<GlossaryItem>>({});
  const [newItem, setNewItem] = useState<Partial<GlossaryItem>>({});
  const [adding, setAdding] = useState(false);

  const startEdit = (item: GlossaryItem) => { setEditing(item.id); setEditData({ ...item }); };

  const saveItem = async (id: string) => {
    const { error } = await supabase.from('glossary').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
  };

  const addItem = async () => {
    if (!newItem.term_original || !newItem.term_arabic) { alert('يرجى ملء المصطلح الأصلي والترجمة'); return; }
    const { error } = await supabase.from('glossary').insert([newItem]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewItem({}); window.location.reload(); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد؟')) return;
    const { error } = await supabase.from('glossary').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>المصطلحات</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة'}</span>
        </button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="المصطلح الأصلي" value={newItem.term_original || ''} onChange={(e) => setNewItem({ ...newItem, term_original: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="الترجمة العربية" value={newItem.term_arabic || ''} onChange={(e) => setNewItem({ ...newItem, term_arabic: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="السبب (اختياري)" value={newItem.reason || ''} onChange={(e) => setNewItem({ ...newItem, reason: e.target.value })} />
            <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              value={newItem.project_id || ''} onChange={(e) => setNewItem({ ...newItem, project_id: e.target.value || null })}>
              <option value="">عام (بدون مشروع)</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
            </select>
          </div>
          <button onClick={addItem} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
        </div>
      )}
      <div className="space-y-2">
        {glossary.map((item) => (
          <div key={item.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === item.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.term_original || ''} onChange={(e) => setEditData({ ...editData, term_original: e.target.value })} />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.term_arabic || ''} onChange={(e) => setEditData({ ...editData, term_arabic: e.target.value })} />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.reason || ''} onChange={(e) => setEditData({ ...editData, reason: e.target.value })} placeholder="السبب" />
                <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.project_id || ''} onChange={(e) => setEditData({ ...editData, project_id: e.target.value || null })}>
                  <option value="">عام</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => saveItem(item.id)} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex gap-4 flex-1">
                  <span className="text-sm">{item.term_original}</span>
                  <span className="text-sm font-bold" style={{ color: 'var(--bronze)' }}>{item.term_arabic}</span>
                  {item.reason && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({item.reason})</span>}
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

