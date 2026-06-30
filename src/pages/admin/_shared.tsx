// src/pages/admin/_shared.tsx
// ponytail: كل الـ utilities المشتركة بين tabs في مكان واحد
import { useState, useEffect } from 'react';
import { Shield, Mail, Lock, AlertTriangle, Plus } from 'lucide-react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { AdminUser } from '@/types';

// ── useAdminAuth ──────────────────────────────────────────────────────────────
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchAdminProfile(session.user.id);
      else { setUser(null); setLoading(false); }
    });

    // Phase 0.1: Periodic status check every 60s — kicks out suspended admins
    const interval = setInterval(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) fetchAdminProfile(session.user.id);
      });
    }, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  async function checkAuth() {
    if (!supabaseConfigured) { setLoading(false); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (session) await fetchAdminProfile(session.user.id);
    else setLoading(false);
  }

  async function fetchAdminProfile(userId: string) {
    const { data, error } = await supabase
      .from('admin_users')
      .select('email, display_name, rank, status, last_login')
      .eq('auth_user_id', userId)
      .single();
    if (error || !data || data.status !== 'active') {
      try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* ignore */ }
      setUser(null);
    } else { setUser(data as AdminUser); }
    setLoading(false);
  }

  async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await fetchAdminProfile(data.user.id);
  }

  async function logout() {
    try { await supabase.auth.signOut({ scope: 'local' }); } catch { /* ignore */ }
    setUser(null);
  }

  return { user, loading, login, logout, isSuperAdmin: user?.rank === 'super_admin', isAdmin: user?.rank === 'admin' || user?.rank === 'super_admin' };
}

// ── LoginScreen ───────────────────────────────────────────────────────────────
export function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await onLogin(email, password); }
    catch (err) { setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0E0C0A' }}>
      <div className="a-card p-8 max-w-sm w-full mx-4" style={{ backgroundColor: 'rgba(14,12,10,0.9)', border: '1px solid rgba(200,168,112,0.2)' }}>
        <div className="text-center mb-6">
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, rgba(200,168,112,0.25), rgba(200,168,112,0.08))', border: '1px solid rgba(200,168,112,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#C8A870' }}>
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cairo', color: '#C8A870' }}>لوحة التحكم</h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(245,240,232,0.45)' }}>تسجيل الدخول للمشرفين فقط</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Cairo' }}>البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--bronze)' }} />
              <input type="email" value={email} required autoFocus onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="w-full px-4 py-2 pr-10 rounded-lg text-right" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }} placeholder="admin@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Cairo' }}>كلمة المرور</label>
            <div className="relative">
              <Lock size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--bronze)' }} />
              <input type="password" value={password} required onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full px-4 py-2 pr-10 rounded-lg text-right" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }} placeholder="••••••••" />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm p-3 rounded-lg" style={{ backgroundColor: 'rgba(200, 80, 80, 0.1)', color: 'var(--error)' }}>
              <AlertTriangle size={14} /><span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-bronze w-full">
            <Shield size={16} /><span>{loading ? 'جاري الدخول...' : 'دخول'}</span>
          </button>
        </form>
        <p className="text-xs text-center mt-4" style={{ color: 'var(--text-secondary)' }}>للحصول على صلاحية الدخول تواصل مع المدير العام</p>
      </div>
    </div>
  );
}

// ── TabButton ─────────────────────────────────────────────────────────────────
export function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap"
      style={{ backgroundColor: active ? '#C8A870' : 'transparent', color: active ? '#0E0C0A' : 'rgba(245,240,232,0.5)', fontFamily: 'Cairo', fontWeight: active ? 700 : 400, border: active ? 'none' : '1px solid rgba(200, 168, 112, 0.2)' }}>
      {icon}<span>{label}</span>
    </button>
  );
}

// ── ArrayInput ────────────────────────────────────────────────────────────────
export function ArrayInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const add = () => { const v = input.trim(); if (v && !values.includes(v)) onChange([...values, v]); setInput(''); };
  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {values.map((v, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded flex items-center gap-1" style={{ backgroundColor: 'rgba(200, 168, 112, 0.2)', color: 'var(--bronze)' }}>
            {v}<button onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-[var(--error)]">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="flex-1 px-3 py-1.5 rounded text-sm" style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder || 'أضف عنصر ثم Enter'} />
        <button onClick={add} className="btn-outline text-sm px-3"><Plus size={14} /></button>
      </div>
    </div>
  );
}
