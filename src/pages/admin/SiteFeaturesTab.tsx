// src/pages/admin/SiteFeaturesTab.tsx
// إصلاح: التبويبة كانت تأخذ قائمة ثابتة من 3 عناصر فقط من الأب (main.tsx)،
// فأي صف جديد في جدول site_features بقاعدة البيانات لن يظهر هنا أبداً.
// الحل: التبويبة تجلب القائمة الكاملة مباشرة من Supabase، وتبقى متزامنة معها.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteFeature } from '@/types';

export function SiteFeaturesTab() {
  const [localFeatures, setLocalFeatures] = useState<SiteFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('site_features')
        .select('key, enabled, label')
        .order('key', { ascending: true });
      if (error) {
        alert('خطأ في تحميل الأقسام: ' + error.message);
      } else {
        setLocalFeatures((data || []) as SiteFeature[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const toggleFeature = async (key: string) => {
    const updated = localFeatures.map((f) => f.key === key ? { ...f, enabled: !f.enabled } : f);
    setLocalFeatures(updated);
    setSaving(true);
    const feature = updated.find((f) => f.key === key);
    if (feature) {
      const { error } = await supabase.from('site_features').update({ enabled: feature.enabled }).eq('key', key);
      if (error) {
        alert('خطأ: ' + error.message);
        // التراجع عن التغيير محلياً إذا فشل الحفظ في القاعدة
        setLocalFeatures(localFeatures);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return <p style={{ color: 'var(--text-secondary)' }}>جاري التحميل...</p>;
  }

  if (localFeatures.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>لا توجد أقسام قابلة للتحكم حالياً.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>التحكم في الأقسام</h2>
      <div className="space-y-3">
        {localFeatures.map((feature) => (
          <div key={feature.key} className="bronze-border p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(200, 168, 112, 0.04)' }}>
            <div>
              <div className="font-bold text-sm" style={{ fontFamily: 'Cairo' }}>{feature.label}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{feature.key}</div>
            </div>
            <button
              onClick={() => toggleFeature(feature.key)}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: feature.enabled ? 'rgba(112, 160, 80, 0.2)' : 'rgba(200, 80, 80, 0.2)',
                color: feature.enabled ? 'var(--success)' : 'var(--error)',
                fontFamily: 'Cairo',
                minWidth: 80,
              }}
            >
              {feature.enabled ? 'مفعل' : 'معطل'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
