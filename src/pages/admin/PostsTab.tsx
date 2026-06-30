// src/pages/admin/PostsTab.tsx
import { useState } from 'react';
import { Plus, Save, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Post, Project, PostCategory } from '@/types';

export function PostsTab({ posts, projects, postCategories }: { posts: Post[]; projects: Project[]; postCategories: PostCategory[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Post>>({});
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newPost, setNewPost] = useState<Partial<Post>>({ tags: [] });
  const [newTagInput, setNewTagInput] = useState('');
  const [editTagInput, setEditTagInput] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  // فلاتر القائمة الرئيسية — لا تؤثر على الإضافة/التعديل
  const [filterProject, setFilterProject] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');

  const startEdit = (p: Post) => { setEditing(p.id); setEditData({ ...p }); };

  const savePost = async (id: string) => {
    setSaving(true);
    const { error } = await supabase.from('posts').update(editData).eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else { setEditing(null); window.location.reload(); }
    setSaving(false);
  };

  const deletePost = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنشور؟')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) alert('خطأ: ' + error.message);
    else window.location.reload();
  };

  const addPost = async () => {
    if (!newPost.title || !newPost.content) { alert('يرجى ملء العنوان والمحتوى'); return; }
    const generatedSlug = newPost.title
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FF\w-]/g, '')
      .toLowerCase();
    const id = generatedSlug + '-' + Date.now();
    const slug = (newPost as Record<string, unknown>).slug as string || generatedSlug;
    setSaving(true);
    const { error } = await supabase.from('posts').insert([{
      ...newPost, id, slug,
      date: new Date().toISOString().split('T')[0],
      tags: newPost.tags || [],
    }]);
    if (error) alert('خطأ: ' + error.message);
    else { setAdding(false); setNewPost({ tags: [] }); setNewTagInput(''); window.location.reload(); }
    setSaving(false);
  };

  // إضافة تصنيف جديد مباشرة من هنا — الأدمن يقدر يسمّي تصنيفه الخاص
  const addCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const slug = name.replace(/\s+/g, '-').replace(/[^\u0600-\u06FF\w-]/g, '').toLowerCase();
    setSaving(true);
    const { error } = await supabase.from('post_categories').insert([{ name, slug, display_order: postCategories.length + 1 }]);
    if (error) alert('خطأ: ' + error.message);
    else { setNewCategoryName(''); setAddingCategory(false); window.location.reload(); }
    setSaving(false);
  };

  const categoryChips = (selectedId: string | null | undefined, onPick: (id: string | null) => void) => (
    <div className="flex gap-2 flex-wrap">
      <button type="button" onClick={() => onPick(null)}
        className="text-xs px-3 py-1 rounded-full"
        style={{ border: `1px solid ${!selectedId ? 'var(--bronze)' : 'rgba(200,168,112,0.25)'}`, backgroundColor: !selectedId ? 'rgba(200,168,112,0.12)' : 'transparent', color: !selectedId ? 'var(--bronze)' : 'var(--text-secondary)' }}>
        بدون تصنيف
      </button>
      {postCategories.map((cat) => (
        <button key={cat.id} type="button" onClick={() => onPick(cat.id)}
          className="text-xs px-3 py-1 rounded-full"
          style={{ border: `1px solid ${selectedId === cat.id ? cat.color : 'rgba(200,168,112,0.25)'}`, backgroundColor: selectedId === cat.id ? `${cat.color}22` : 'transparent', color: selectedId === cat.id ? cat.color : 'var(--text-secondary)' }}>
          {cat.name}
        </button>
      ))}
      {addingCategory ? (
        <div className="flex items-center gap-1">
          <input autoFocus className="text-xs px-2 py-1 rounded-full w-28" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCategory(); }} placeholder="اسم التصنيف" />
          <button type="button" onClick={addCategory} className="p-1 rounded-full hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Save size={12} /></button>
          <button type="button" onClick={() => { setAddingCategory(false); setNewCategoryName(''); }} className="p-1 rounded-full hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><X size={12} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => setAddingCategory(true)}
          className="text-xs px-3 py-1 rounded-full flex items-center gap-1" style={{ border: '1px dashed rgba(200,168,112,0.4)', color: 'var(--bronze)' }}>
          <Plus size={11} /> تصنيف جديد
        </button>
      )}
    </div>
  );

  const postFields = (data: Partial<Post>, setData: (d: Partial<Post>) => void, tagInput: string, setTagInput: (s: string) => void) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="md:col-span-2">
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>العنوان</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.title || ''} onChange={(e) => setData({ ...data, title: e.target.value })} placeholder="عنوان المنشور" />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>Slug (اختياري)</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.slug || ''} onChange={(e) => setData({ ...data, slug: e.target.value })} placeholder="my-post-slug" />
      </div>
      <div>
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>المشروع المرتبط</label>
        <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.project_id || ''} onChange={(e) => setData({ ...data, project_id: e.target.value || null })}>
          <option value="">بدون مشروع</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>التصنيف</label>
        {categoryChips(data.category_id, (id) => setData({ ...data, category_id: id }))}
      </div>
      <div className="md:col-span-2">
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>مقتطف (Excerpt)</label>
        <input className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.excerpt || ''} onChange={(e) => setData({ ...data, excerpt: e.target.value })} placeholder="وصف مختصر يظهر في القائمة" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>المحتوى</label>
        <textarea className="w-full px-3 py-1.5 rounded text-sm" rows={6} style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={data.content || ''} onChange={(e) => setData({ ...data, content: e.target.value })} placeholder="محتوى المنشور الكامل" />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>الوسوم (Tags)</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {(data.tags || []).map((tag, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded flex items-center gap-1"
              style={{ backgroundColor: 'rgba(200, 168, 112, 0.2)', color: 'var(--bronze)' }}>
              {tag}
              <button onClick={() => setData({ ...data, tags: (data.tags || []).filter((_, j) => j !== i) })}
                className="hover:text-[var(--error)]">x</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={tagInput} onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagInput.trim();
                if (tag && !(data.tags || []).includes(tag)) setData({ ...data, tags: [...(data.tags || []), tag] });
                setTagInput('');
              }
            }}
            placeholder="أضف وسماً ثم Enter" />
          <button onClick={() => {
            const tag = tagInput.trim();
            if (tag && !(data.tags || []).includes(tag)) setData({ ...data, tags: [...(data.tags || []), tag] });
            setTagInput('');
          }} className="btn-outline text-sm px-3"><Plus size={14} /></button>
        </div>
      </div>
    </div>
  );

  const filteredPosts = posts.filter((p) => {
    if (filterProject && p.project_id !== filterProject) return false;
    if (filterCategory && p.category_id !== filterCategory) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>المنشورات</h2>
        <button onClick={() => setAdding(!adding)} className="btn-bronze text-sm">
          <Plus size={14} /> <span>{adding ? 'إلغاء' : 'إضافة منشور'}</span>
        </button>
      </div>

      {/* فلاتر القائمة */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bronze-border" style={{ backgroundColor: 'rgba(200, 168, 112, 0.02)' }}>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>فلترة بالمشروع</label>
          <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
            <option value="">كل المشاريع</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title || p.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs block mb-1" style={{ color: 'var(--text-secondary)' }}>فلترة بالتصنيف</label>
          <select className="w-full px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">كل التصنيفات</option>
            {postCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {adding && (
        <div className="bronze-border p-4 mb-6 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
          <h3 className="font-bold text-sm" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>منشور جديد</h3>
          {postFields(newPost, setNewPost, newTagInput, setNewTagInput)}
          <div className="flex gap-2">
            <button onClick={addPost} disabled={saving} className="btn-bronze text-sm">
              <Save size={14} /> <span>{saving ? 'جاري الحفظ...' : 'نشر'}</span>
            </button>
            <button onClick={() => { setAdding(false); setNewPost({ tags: [] }); setNewTagInput(''); }} className="btn-outline text-sm">
              <X size={14} /> <span>إلغاء</span>
            </button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {filteredPosts.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>لا توجد منشورات مطابقة للفلتر</p>
        )}
        {filteredPosts.map((p) => {
          const cat = postCategories.find((c) => c.id === p.category_id);
          return (
          <div key={p.id} className="bronze-border p-4" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            {editing === p.id ? (
              <div className="space-y-3">
                {postFields(editData, setEditData, editTagInput, setEditTagInput)}
                <div className="flex gap-2">
                  <button onClick={() => savePost(p.id)} disabled={saving} className="btn-bronze text-sm"><Save size={14} /> <span>حفظ</span></button>
                  <button onClick={() => setEditing(null)} className="btn-outline text-sm"><X size={14} /> <span>إلغاء</span></button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{p.title}</span>
                    {cat && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cat.color}22`, color: cat.color }}>{cat.name}</span>
                    )}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{new Date(p.date).toLocaleDateString('en-US')}</div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-[var(--bronze)]/10" style={{ color: 'var(--bronze)' }}><Edit2 size={14} /></button>
                  <button onClick={() => deletePost(p.id)} className="p-2 rounded-lg hover:bg-[var(--error)]/10" style={{ color: 'var(--error)' }}><Trash2 size={14} /></button>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

