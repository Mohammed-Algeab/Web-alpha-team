// components/AppButton.tsx
//
// ponytail: الزر يفتح رابط الـPWA المستقل (PWA_URL، راجع lib/pwaUrl.ts)
// بتبويب جديد عادي — وليس <Link> من react-router. الـPWA لم يعد مساراً
// داخل نطاق هذا الموقع (لا "/app" ولا أي مسار فرعي)، بل موقع منفصل بدومينه
// الخاص، فـ<Link> غير مناسب من الأساس هنا (مصمم حصرياً لمسارات داخلية ضمن
// نفس الـRouter).
import { Smartphone } from 'lucide-react';
import { PWA_URL } from '@/lib/pwaUrl';

interface AppButtonProps {
  /** 'header': نسخة مدمجة صغيرة لشريط الهيدر. 'sidebar': صف كامل العرض يطابق باقي روابط القائمة المنزلقة. */
  variant?: 'header' | 'sidebar';
  onClick?: () => void;
}

export default function AppButton({ variant = 'header', onClick }: AppButtonProps) {
  if (variant === 'sidebar') {
    return (
      <a
        href={PWA_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        style={{
          width: '100%',
          padding: '11px 14px',
          textDecoration: 'none',
          borderRadius: 9,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 4,
          background: 'linear-gradient(135deg, rgba(var(--bronze-rgb),0.16), rgba(var(--bronze-rgb),0.06))',
          border: '1px solid rgba(var(--bronze-rgb), 0.3)',
          color: 'var(--bronze)',
          fontWeight: 700,
        }}
      >
        <span style={{ flex: 1, textAlign: 'right' }}>حمّل التطبيق</span>
        <Smartphone size={16} style={{ flexShrink: 0 }} />
      </a>
    );
  }

  // variant === 'header' — نسخة مدمجة، أيقونة + نص يختفي على الشاشات الضيقة
  // جداً (يبقى الزر نفسه ظاهراً دائماً، فقط النص يتقلّص لتوفير مساحة)
  return (
    <a
      href={PWA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="حمّل التطبيق"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: 40,
        padding: '0 12px',
        borderRadius: 9,
        flexShrink: 0,
        textDecoration: 'none',
        background: 'linear-gradient(135deg, var(--bronze), #C8A870)',
        color: '#0E0C0A',
        fontWeight: 700,
        fontSize: '0.82rem',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 10px rgba(var(--bronze-rgb), 0.25)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 14px rgba(var(--bronze-rgb), 0.4)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 2px 10px rgba(var(--bronze-rgb), 0.25)';
      }}
    >
      <Smartphone size={15} />
      {/* النص يختفي تحت 380px تقريباً عبر CSS class، الأيقونة تبقى دائماً */}
      <span className="app-btn-label">التطبيق</span>
    </a>
  );
}
