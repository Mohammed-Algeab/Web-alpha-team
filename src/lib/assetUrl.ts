// src/lib/assetUrl.ts
// ponytail: import.meta.env.BASE_URL هو متغيّر Vite الرسمي الذي يحلّ هذه
// المشكلة تلقائياً — يساوي './' أو '/' أو '/repo-name/' حسب قيمة `base` في
// vite.config.ts ومكان الاستضافة الفعلي وقت البناء، بخلاف كتابة '/images/...'
// كمسار مطلق ثابت يفترض دوماً أن الموقع على جذر الدومين (يفشل على GitHub
// Pages تحت مسار فرعي مثل username.github.io/repo-name/).
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL; // مثال: '/' أو './' أو '/alpha-team-website/'
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}${cleanPath}`;
}
