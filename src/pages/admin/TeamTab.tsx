// src/pages/admin/TeamTab.tsx — Phase 0.4: Manage team members
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { TeamMember } from '@/types';

export function TeamTab({ team }: { team: TeamMember[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TeamMember>>({});
  const [newItem, setNewItem] = useState<Partial<TeamMember>>({});
  const [adding, setAdding] = useState(false);

  const startEdit = (item: TeamMember) => { setEditing(item.id); setEditData({ ...item }); };

  const saveItem = async (id: string) => {
    const { error } = await supabase.from('team').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.role) { alert('يرجى ملء الاسم والدور'); return; }
    const { error } = await supabase.from('team').insert([newItem]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewItem({}); window.location.reload(); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العضو؟')) return;
    const { error } = await supabase.from('team').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>أعضاء الفريق</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة عضو'}</span>
        </button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="اسم العضو" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="الدور (مثال: مترجم، مبرمج)" value={newItem.role || ''} onChange={(e) => setNewItem({ ...newItem, role: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="رابط الصورة (اختياري)" value={newItem.avatar || ''} onChange={(e) => setNewItem({ ...newItem, avatar: e.target.value })} />
            <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
              placeholder="تاريخ الانضمام (YYYY-MM-DD)" value={newItem.joined_date || ''} onChange={(e) => setNewItem({ ...newItem, joined_date: e.target.value })} />
          </div>
          <button onClick={addItem} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
        </div>
      )}
      <div className="space-y-2">
        {team.map((item) => (
          <div key={item.id} className="bronze-border p-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === item.id ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.name || ''} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="الاسم" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.role || ''} onChange={(e) => setEditData({ ...editData, role: e.target.value })} placeholder="الدور" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.avatar || ''} onChange={(e) => setEditData({ ...editData, avatar: e.target.value })} placeholder="رابط الصورة" />
                <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                  value={editData.joined_date || ''} onChange={(e) => setEditData({ ...editData, joined_date: e.target.value })} placeholder="تاريخ الانضمام" />
                <div className="flex gap-2">
                  <button onClick={() => saveItem(item.id)} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {item.avatar && (
                    <img src={item.avatar} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div>
                    <span className="text-sm font-semibold block">{item.name}</span>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.role}</span>
                  </div>
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
