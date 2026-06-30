// src/pages/admin/IndependentTab.tsx — Phase 0.4: Manage independent translations
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Independent } from '@/types';

export function IndependentTab({ independent }: { independent: Independent[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Independent>>({});
  const [newItem, setNewItem] = useState<Partial<Independent>>({});
  const [adding, setAdding] = useState(false);

  const startEdit = (item: Independent) => { setEditing(item.id); setEditData({ ...item }); };

  const saveItem = async (id: string) => {
    const { error } = await supabase.from('independent').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.link) { alert('يرجى ملء الاسم والوصف والرابط'); return; }
    const { error } = await supabase.from('independent').insert([newItem]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewItem({}); window.location.reload(); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    const { error } = await supabase.from('independent').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>تعريبات مستقلة</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة تعريب'}</span>
        </button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="اسم التعريب" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="النوع" value={newItem.type || ''} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="الوصف" value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="الرابط" value={newItem.link || ''} onChange={(e) => setNewItem({ ...newItem, link: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="رابط الصورة (اختياري)" value={newItem.cover || ''} onChange={(e) => setNewItem({ ...newItem, cover: e.target.value || null })} />
          </div>
          <button onClick={addItem} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
        </div>
      )}
      <div className="space-y-2">
        {independent.map((item) => (
          <div key={item.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === item.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="الاسم" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.type || ''} onChange={(e) => setEditData({ ...editData, type: e.target.value })} placeholder="النوع" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.description || ''} onChange={(e) => setEditData({ ...editData, description: e.target.value })} placeholder="الوصف" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.link || ''} onChange={(e) => setEditData({ ...editData, link: e.target.value })} placeholder="الرابط" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.cover || ''} onChange={(e) => setEditData({ ...editData, cover: e.target.value || null })} placeholder="رابط الصورة" />
                <div className="flex gap-2">
                  <button onClick={() => saveItem(item.id)} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-sm font-semibold block">{item.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.type} &middot; {item.description}</span>
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
