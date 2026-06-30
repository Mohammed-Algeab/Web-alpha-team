// src/pages/admin/FAQTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { FAQItem } from '@/types';

export function FAQTab({ faq }: { faq: FAQItem[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<FAQItem>>({});
  const [newItem, setNewItem] = useState<Partial<FAQItem>>({ order: 0 });
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = (item: FAQItem) => { setEditing(item.id); setEditData({ ...item }); };

  const saveItem = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('faq').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
    setSaving(false);
  };

  const addItem = async () => {
    if (!newItem.question || !newItem.answer) { alert('يرجى ملء السؤال والجواب'); return; }
    setSaving(true);
    const { error } = await supabase.from('faq').insert([{ ...newItem, is_active: true }]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewItem({ order: 0 }); window.location.reload(); }
    setSaving(false);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    const { error } = await supabase.from('faq').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  const faqFields = (data: Partial<FAQItem>, setData: (d: Partial<FAQItem>) => void) => (
    <div className="space-y-3">
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>السؤال</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.question || ''} onChange={(e) => setData({ ...data, question: e.target.value })} placeholder="ما هو..." />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الإجابة</label>
        <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={3} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.answer || ''} onChange={(e) => setData({ ...data, answer: e.target.value })} placeholder="الإجابة التفصيلية..." />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الترتيب</label>
        <input type="number" min="0" className="w-24 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.order ?? 0} onChange={(e) => setData({ ...data, order: parseInt(e.target.value) })} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>الأسئلة الشائعة</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة سؤال'}</span>
        </button>
      </div>
      {adding && (
        <div className="bronze-border p-4 mb-4 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>سؤال جديد</h3>
          {faqFields(newItem, setNewItem)}
          <div className="flex gap-2">
            <button onClick={addItem} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>{saving ? 'جاري...' : 'حفظ'}</span></button>
            <button onClick={() => setAdding(false)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {[...faq].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => (
          <div key={item.id} className="bronze-border p-4" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === item.id ? (
              <div className="space-y-3">
                {faqFields(editData, setEditData)}
                <div className="flex gap-2">
                  <button onClick={() => saveItem(item.id)} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(200,168,112,0.15)', color: 'var(--bronze)' }}>#{item.order}</span>
                    <span className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{item.question}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.answer}</p>
                </div>
                <div className="flex gap-1 shrink-0">
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

