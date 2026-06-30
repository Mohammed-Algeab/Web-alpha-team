// lib/pwaUrl.ts
//
// ponytail: مصدر واحد لرابط تطبيق الـPWA المستقل. سابقاً كانت أزرار "حمّل
// التطبيق" تشير لمسار داخلي "/app/" بافتراض أن الـPWA منشور تحت نفس دومين
// هذا الموقع. هذا القرار أُلغي: فكرة "موقعين داخل موقع واحد" (نفس الدومين،
// مسارين منفصلين بـRouter مختلف لكل منهما) تسبب تعقيداً غير ضروري في
// الاستضافة (قواعد _redirects، تعارض الـRouters، 404 عند reload على
// استضافات لا تدعم SPA rewrite). الآن: الـPWA مشروع وموقع مستقل تماماً،
// بدومين/رابط خاص به، ووظيفة هذا الملف الوحيدة توفير ذلك الرابط لكل مكان
// يحتاجه بدل تكراره يدوياً في كل مكون.
//
// اضبط VITE_PWA_URL في ملف .env (نفس مكان VITE_SITE_URL) إلى رابط نشر
// الـPWA الفعلي بعد نشره، ثم أعد البناء (pnpm build).
const RAW_PWA_URL = (import.meta.env.VITE_PWA_URL as string | undefined)?.trim();

// رابط افتراضي مؤقت يظهر فقط إن نُسي ضبط VITE_PWA_URL — يمنع كسر الزر
// بصمت (رابط فارغ) وينبّه بوضوح في الـconsole بدل فشل غامض لاحقاً.
const FALLBACK_PWA_URL = 'https://REPLACE-WITH-PWA-URL.example.com/';

if (!RAW_PWA_URL && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[pwaUrl] VITE_PWA_URL غير مضبوط في .env — أزرار "حمّل التطبيق" تشير حالياً لرابط مؤقت. ضع رابط نشر الـPWA الفعلي.'
  );
}

export const PWA_URL = RAW_PWA_URL && RAW_PWA_URL.length > 0 ? RAW_PWA_URL : FALLBACK_PWA_URL;

// رابط صفحة شرح التثبيت داخل الـPWA (تُستخدم لمستخدمي iOS الذين لا يدعم
// متصفحهم تثبيتاً بضغطة واحدة). الـPWA يعتمد الآن HashRouter بدل
// BrowserRouter (راجع pwa/src/App.tsx)، لذا المسار الداخلي يبدأ بـ"#/".
export const PWA_INSTALL_URL = `${PWA_URL.replace(/\/$/, '')}/#/install`;
