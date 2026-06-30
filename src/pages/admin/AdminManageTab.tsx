// src/pages/admin/AdminManageTab.tsx
import { useState, useEffect } from 'react';
import { Plus, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminManageTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const [admins, setAdmins] = useState<Array<{ email: string; display_name?: string; rank: string; status: string; last_login?: string; login_count: number; created_at?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRank, setInviteRank] = useState<'admin' | 'editor'>('editor');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (isSuperAdmin) loadAdmins();
  }, [isSuperAdmin]);

  async function loadAdmins() {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, display_name, rank, status, last_login, login_count, created_at')
      .order('created_at', { ascending: false });
    if (!error) setAdmins(data || []);
    setLoading(false);
  }

  async function addAdmin() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    const { error } = await supabase.from('admin_users').insert([{
      email: inviteEmail.trim(),
      rank: inviteRank,
      status: 'active',
    }]);
    if (error) alert('خطأ: ' + error.message);
    else {
      setInviteEmail('');
      loadAdmins();
      alert('تم الإضافة — أنشئ حساب المشرف من Supabase Dashboard > Authentication > Users > Invite user');
    }
    setInviting(false);
  }

  async function toggleStatus(email: string, newStatus: string) {
    const { error } = await supabase.from('admin_users').update({ status: newStatus }).eq('email', email);
    if (error) alert('خطأ: ' + error.message);
    else loadAdmins();
  }

  if (!isSuperAdmin) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
        <Shield size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <p>هذه الصفحة متاحة للمدير العام فقط</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>إدارة المشرفين</h2>
      <div className="text-xs mb-4 p-3 rounded-lg" style={{ color: 'var(--text-secondary)', backgroundColor: 'rgba(200,168,112,0.06)', border: '1px solid rgba(200,168,112,0.2)' }}>
        بعد إضافة البريد هنا، أنشئ الحساب يدوياً من: Supabase Dashboard &gt; Authentication &gt; Users &gt; Invite user
      </div>
      <div className="bronze-border p-4 mb-6 space-y-3" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
        <h3 className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>إضافة مشرف جديد</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input type="email" className="w-full px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            placeholder="البريد الإلكتروني" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
          <select className="w-full px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
            value={inviteRank} onChange={(e) => setInviteRank(e.target.value as 'admin' | 'editor')}>
            <option value="editor">محرر (Editor)</option>
            <option value="admin">مشرف (Admin)</option>
          </select>
          <button onClick={addAdmin} disabled={inviting} className="btn-bronze text-sm">
            <Plus size={14} /> <span>{inviting ? 'جاري...' : 'إضافة'}</span>
          </button>
        </div>
      </div>
      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</p>
      ) : (
        <div className="space-y-2">
          {admins.map((admin) => (
            <div key={admin.email} className="bronze-border p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
              <div>
                <div className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{admin.display_name || admin.email}</div>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--bronze)', color: 'var(--bg)' }}>
                    {admin.rank === 'super_admin' ? 'مدير عام' : admin.rank === 'admin' ? 'مشرف' : 'محرر'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{
                    backgroundColor: admin.status === 'active' ? 'rgba(112, 160, 80, 0.2)' : admin.status === 'pending' ? 'rgba(200, 168, 112, 0.15)' : 'rgba(200, 80, 80, 0.2)',
                    color: admin.status === 'active' ? 'var(--success)' : admin.status === 'pending' ? 'var(--bronze)' : 'var(--error)',
                  }}>
                    {admin.status === 'active' ? 'نشط' : admin.status === 'pending' ? 'معلق' : 'موقوف'}
                  </span>
                  {admin.last_login && (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      آخر دخول: {new Date(admin.last_login).toLocaleDateString('en-US')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                {admin.status === 'active' && admin.rank !== 'super_admin' && (
                  <button onClick={() => toggleStatus(admin.email, 'suspended')}
                    className="text-xs px-3 py-1.5 rounded" style={{ backgroundColor: 'rgba(200, 80, 80, 0.2)', color: 'var(--error)' }}>
                    توقيف
                  </button>
                )}
                {admin.status === 'suspended' && (
                  <button onClick={() => toggleStatus(admin.email, 'active')}
                    className="text-xs px-3 py-1.5 rounded" style={{ backgroundColor: 'rgba(112, 160, 80, 0.2)', color: 'var(--success)' }}>
                    تفعيل
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

