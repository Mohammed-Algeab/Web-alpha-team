// src/components/GiscusComments.tsx
// Giscus comments integration — uses @giscus/react with custom Alpha Team theme
// ponytail: giscus.app (origin خارجي) هو من يجلب CSS الثيم المخصص فعلياً —
// لذا الرابط يجب أن يكون نطاقاً عاماً يصل له خادم giscus.app. في localhost
// (تطوير محلي) هذا مستحيل بنيوياً، فنستخدم ثيم giscus المدمج كـfallback مؤقت
// فقط في تلك الحالة، ونستخدم ملفاتنا المخصصة (alpha-dark/alpha-light) في الإنتاج.

import Giscus from '@giscus/react';

interface GiscusCommentsProps {
  term: string;          // e.g., "project:123" or "post:456"
  mapping?: 'specific' | 'pathname' | 'title';
  theme?: 'alpha-dark' | 'alpha-light';
}

// Giscus configuration — القيم الحقيقية من https://giscus.app بعد ربط
// GitHub Discussions بمستودع Mohammed-Algeab/Alpha-Team (وليس اسم منظمة
// منفصل — لاحظ أن giscus حساس لتطابق owner/repo حرفياً مع GitHub).
const GISCUS_CONFIG = {
  repo: 'Mohammed-Algeab/Alpha-Team' as `${string}/${string}`,
  repoId: 'R_kgDOTG207Q',
  category: 'Comments',
  categoryId: 'DIC_kwDOTG207c4DAAUY',
} as const;

// النطاق العام الذي ستُنشر عليه ملفات الثيم فعلياً — يجب أن يطابق نطاق الإنتاج
// الحقيقي للموقع، لأن giscus.app (خادم خارجي) هو من يجلب هذا الرابط، لا متصفح
// الزائر نفسه. لا تتركه فاضياً ولا تستخدم window.location.origin مباشرة.
// ponytail: مصدره web/.env (VITE_SITE_URL) — تغيير الدومين مستقبلاً (دومين
// مخصص بدل GitHub Pages) يكون بتعديل ذلك السطر فقط، لا البحث هنا.
const PRODUCTION_ORIGIN = import.meta.env.VITE_SITE_URL as string;

function resolveThemeUrl(theme: 'alpha-dark' | 'alpha-light'): string {
  const filename = theme === 'alpha-dark' ? 'alpha-dark.css' : 'alpha-light.css';
  const isLocalDev = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.|10\.)/.test(window.location.hostname);

  if (isLocalDev) {
    // giscus.app لا يستطيع الوصول لـ localhost أبداً (عنوان شبكة محلية فقط) —
    // نستخدم ثيم giscus المدمج المقارب بدل رابط مكسور أثناء التطوير المحلي فقط.
    return theme === 'alpha-dark' ? 'dark_dimmed' : 'light';
  }

  return `${PRODUCTION_ORIGIN}/giscus/${filename}`;
}

export function GiscusComments({
  term,
  mapping = 'specific',
  theme = 'alpha-dark',
}: GiscusCommentsProps) {
  const themeValue = resolveThemeUrl(theme);

  return (
    <div className="giscus-wrapper" style={{
      marginTop: '2rem',
      padding: '1.5rem',
      borderRadius: '14px',
      background: 'var(--card-surface)',
      border: '1px solid rgba(var(--bronze-rgb), 0.12)',
    }}>
      <div style={{
        marginBottom: '1rem',
        paddingBottom: '0.75rem',
        borderBottom: '1px solid rgba(var(--bronze-rgb), 0.08)',
      }}>
        <h3 style={{
          fontFamily: 'Cairo, system-ui, sans-serif',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--bronze)',
          margin: 0,
        }}>
          التعليقات
        </h3>
        <p style={{
          fontFamily: 'Cairo, system-ui, sans-serif',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          margin: '0.25rem 0 0',
          opacity: 0.7,
        }}>
          يتطلب حساب GitHub للتعليق &middot; محفوظة داخل GitHub Discussions
        </p>
      </div>

      <Giscus
        id="giscus-comments"
        repo={GISCUS_CONFIG.repo}
        repoId={GISCUS_CONFIG.repoId}
        category={GISCUS_CONFIG.category}
        categoryId={GISCUS_CONFIG.categoryId}
        mapping={mapping}
        term={term}
        strict="1"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={themeValue}
        lang="ar"
        loading="lazy"
      />
    </div>
  );
}

// Helper to generate consistent term strings — term هو الآن فقط الـid
// الخام، وليس رابطاً كاملاً. giscus يستخدمه فقط كنص مطابقة (data-mapping=
// "specific")، فلا حاجة لكونه عنوان URL أصلاً. هذا يضمن تطابق term بين
// web والـPWA بغض النظر عن الدومين أو base path (PWA يُنشر تحت /app/، وكان
// هذا يكسر التطابق سابقاً عندما كان term رابطاً كاملاً).
export function getGiscusTerm(_type: 'project' | 'post', id: string): string {
  return id;
}
