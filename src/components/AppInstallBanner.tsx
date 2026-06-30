// components/AppInstallBanner.tsx
//
// ponytail: محاولة سابقة اعتمدت على beforeinstallprompt حتى على Android —
// لكن هذا الموقع (web) ليس PWA بذاته: لا manifest ولا service worker
// مسجَّلين هنا، هذان موجودان فقط في مشروع الـPWA المستقل. فحدث
// beforeinstallprompt لا يصل لهذه الصفحة إطلاقاً مهما انتظرنا — هذا سبب
// اختفاء الزر بالكامل الذي رُصِد.
//
// الدور الصحيح لهذا البانر هنا: مجرد *إعلان وتوجيه* لوجود تطبيق منفصل
// (PWA_URL، راجع lib/pwaUrl.ts) — وليس تنفيذ التثبيت بنفسه. القرار الفعلي
// للتثبيت (والـbeforeinstallprompt الحقيقي إن وُجد) يحدث داخل موقع الـPWA
// نفسه. لذلك الظهور هنا لا يعتمد على أي حدث متصفح غير موثوق — فقط على كشف
// نظام التشغيل (ثابت 100% فور تحميل الصفحة)، فلا "أحياناً يظهر وأحياناً
// لا" بعد الآن.
import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share } from 'lucide-react';
import { PWA_URL, PWA_INSTALL_URL } from '@/lib/pwaUrl';

export default function AppInstallBanner() {
  const [dismissed, setDismissed] = useState(true); // true افتراضياً يمنع الوميض قبل فحص localStorage
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setIsIOS(/iphone|ipad|ipod/i.test(navigator.userAgent));

    // إن كان هذا التبويب نفسه مفتوحاً من داخل التطبيق المثبَّت (نادر لكن
    // ممكن عبر رابط خارجي)، لا داعي لدعوته لتثبيت ما يستخدمه أصلاً.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    setDismissed(!!localStorage.getItem('app-banner-dismissed'));
  }, []);

  const handlePrimaryAction = () => {
    // Android/سطح المكتب: التطبيق الحقيقي القابل للتثبيت على PWA_URL — هناك
    // beforeinstallprompt قد يصل فعلياً (manifest+SW موجودان هناك)، أو
    // المستخدم يثبّته يدوياً من قائمة المتصفح. iOS: لا يوجد تثبيت بضغطة
    // واحدة على أي إصدار من Safari، فنوجّهه مباشرة لشرح خطوات الإضافة.
    window.open(isIOS ? PWA_INSTALL_URL : PWA_URL, '_blank');
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('app-banner-dismissed', '1');
  };

  if (installed || dismissed) return null;

  return (
    <div
      role="banner"
      aria-label="تطبيق فريق ألفا متاح"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'min(92vw, 420px)',
        background: 'linear-gradient(135deg, var(--card-surface) 0%, rgba(var(--bronze-rgb),0.06) 100%)',
        border: '1px solid rgba(var(--bronze-rgb), 0.25)',
        borderRadius: 18,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        animation: 'bannerSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      }}
    >
      <style>{`
        @keyframes bannerSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* أيقونة */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, var(--bronze), #F0D080)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Smartphone size={22} color="#0E0C0A" />
      </div>

      {/* نص */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
          حمّل التطبيق
        </p>
        <p style={{ margin: '2px 0 0', fontSize: '0.73rem', color: 'rgba(var(--text-rgb),0.5)', lineHeight: 1.4 }}>
          {isIOS ? 'أضفه لشاشتك الرئيسية للوصول السريع' : 'ثبّته على جهازك — يعمل حتى بدون إنترنت'}
        </p>
      </div>

      {/* زر فتح صفحة التطبيق — نفس الزر دائماً، فقط الوجهة تختلف حسب النظام */}
      <button
        onClick={handlePrimaryAction}
        style={{
          flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 10,
          background: 'linear-gradient(135deg, var(--bronze), #C8A870)',
          color: '#0E0C0A', fontWeight: 700, fontSize: '0.78rem',
          border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        {isIOS ? <Share size={14} /> : <Download size={14} />}
        {isIOS ? 'كيف؟' : 'فتح التطبيق'}
      </button>

      {/* زر الإغلاق */}
      <button
        onClick={handleDismiss}
        aria-label="إغلاق"
        style={{
          flexShrink: 0, background: 'none', border: 'none',
          cursor: 'pointer', padding: 4, color: 'rgba(var(--text-rgb),0.35)',
          display: 'flex', alignItems: 'center',
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
