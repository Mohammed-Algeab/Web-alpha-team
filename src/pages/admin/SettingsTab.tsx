// src/pages/admin/SettingsTab.tsx
import { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Settings as SettingsType } from '@/types';

export function SettingsTab({ settings }: { settings: SettingsType | null }) {
  const [formData, setFormData] = useState<Partial<SettingsType>>(settings || {});
  const [saving, setSaving] = useState(false);

  const saveSettings = async () => {
    setSaving(true);
    const { error } = await supabase.from('settings').update(formData).eq('id', 1);
    if (error) alert('خطأ: ' + error.message);
    else alert('تم الحفظ بنجاح');
    setSaving(false);
  };

  const fields: { key: keyof SettingsType; label: string }[] = [
    { key: 'site_name', label: 'اسم الموقع' },
    { key: 'tagline', label: 'الشعار (Tagline)' },
    { key: 'site_description', label: 'وصف الموقع (SEO)' },
    { key: 'keywords', label: 'الكلمات المفتاحية (SEO)' },
    { key: 'telegram_channel', label: 'قناة التيليغرام' },
    { key: 'telegram_group', label: 'مجموعة التيليغرام' },
    { key: 'email', label: 'البريد الإلكتروني' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>الإعدادات العامة</h2>
      <div className="bronze-border p-5 space-y-4 max-w-lg" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="text-sm block mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'Cairo' }}>{label}</label>
            {key === 'site_description' || key === 'keywords' ? (
              <textarea
                className="w-full px-3 py-2 rounded text-sm"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                value={(formData[key] as string) || ''}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                rows={key === 'site_description' ? 3 : 2}
              />
            ) : (
              <input
                className="w-full px-3 py-2 rounded text-sm"
                style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--bronze)', color: 'var(--text)' }}
                value={(formData[key] as string) || ''}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
              />
            )}
          </div>
        ))}
        <button onClick={saveSettings} disabled={saving} className="btn-bronze text-sm">
          <Save size={14} /> <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
        </button>
      </div>
    </div>
  );
}

