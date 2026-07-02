// scripts/generate-pages.mjs
//
// ponytail: هذا السكربت يولّد صفحة HTML حقيقية ومستقلة لكل مشروع ومنشور
// (dist/projects/{id}/index.html و dist/blog/{id}/index.html) بدل الاعتماد
// على HashRouter وحده. الهدف: أي زائر أو محرك بحث يفتح هذا الرابط مباشرة
// يستلم HTML فيه العنوان/الوصف/الصورة الحقيقية جاهزة فوراً — بدون انتظار
// تحميل React أو استعلام JS. بعدها React يستولي على #root بشكل طبيعي
// ويجعل الصفحة تفاعلية كاملة (تماماً كأي صفحة SPA أخرى بالموقع).
//
// كيف يعمل:
//  1. يقرأ dist/index.html (بعد أن بناه Vite بالفعل) — هذا يضمن أننا نعيد
//     استخدام نفس وسوم <script>/<link> الحقيقية (بأسماء الملفات المُجزّأة
//     hash التي يولدها Vite تلقائياً)، فلا داعي لتخمينها يدوياً.
//  2. يجيب كل الصفوف من جدولي projects و posts عبر Supabase REST مباشرة
//     (فقط قراءة عامة عبر anon key — يجب أن تسمح سياسات RLS بـ SELECT
//     للقراءة العامة على هذين الجدولين، وإلا سيرجع السكربت مصفوفة فارغة).
//  3. لكل صف: يستنسخ index.html، يستبدل الـ<title>/meta/OG/JSON-LD،
//     ويحقن محتوى ثابت مقروء داخل <div id="root">...</div>.
//  4. يكتب الناتج في dist/projects/{id}/index.html (يخدمها Cloudflare Pages
//     كملف ثابت مباشرة، أولوية أعلى من قاعدة _redirects العامة).
//  5. ينسخ نفس الملفات أيضاً إلى web/generated-pages/ (مسار متتبَّع بـ git)
//     حتى تقدر تتصفحها/تراجعها من داخل المستودع مباشرة. ⚠️ لو عدّلت ملفاً
//     هناك يدوياً، تذكّر أن أي تشغيل لاحق لهذا السكربت (تلقائي عبر
//     GitHub Actions أو يدوي) سيستبدله من جديد ببيانات Supabase الحالية —
//     التعديلات اليدوية الدائمة يجب أن تكون على بيانات Supabase نفسها
//     (مثلاً أعمدة meta_title/meta_description إن أضفتها) وليس على الملف.
//
// التشغيل محلياً للاختبار (Node 20+):
//   pnpm build && node --env-file=.env scripts/generate-pages.mjs
//
// في GitHub Actions: يُشغَّل تلقائياً كخطوة postbuild ثانية (راجع
// .github/workflows/generate-pages.yml) بعد أن تكون Secrets معرّفة كمتغيرات بيئة.

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, cpSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const GENERATED_TRACKED_DIR = resolve(ROOT, 'generated-pages'); // مسار متتبَّع بـgit، للمراجعة فقط

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SITE_URL = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
const SITE_NAME = 'فريق ألفا للتعريب';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[generate-pages] VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير مضبوطين — تخطّي التوليد.');
  process.exit(0); // لا نكسر البناء بسبب هذا — فقط لا نولّد شيئاً
}

if (!SITE_URL) {
  console.warn('[generate-pages] VITE_SITE_URL غير مضبوط — الروابط الكانونية/OG ستكون فارغة جزئياً.');
}

if (!existsSync(DIST) || !existsSync(resolve(DIST, 'index.html'))) {
  console.error('[generate-pages] dist/index.html غير موجود — شغّل vite build أولاً.');
  process.exit(1);
}

const SHELL_HTML = readFileSync(resolve(DIST, 'index.html'), 'utf-8');

// -------------------------------------------------------------------------
// أدوات مساعدة عامة
// -------------------------------------------------------------------------

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(str = '', max = 160) {
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

function absoluteUrl(path = '') {
  if (!path) return `${SITE_URL}/images/logo.png`;
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

async function fetchTable(table, select = '*') {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    console.error(`[generate-pages] فشل جلب ${table}: ${res.status} ${res.statusText}`);
    return [];
  }
  return res.json();
}

// يبني نسخة من قالب index.html المبني فعلياً، مع استبدال رأس الصفحة
// (title/meta/OG/JSON-LD) ومحتوى #root، مع الإبقاء على كل وسوم
// <script>/<link> الحقيقية كما هي تماماً.
function buildPage({ title, description, image, canonicalUrl, jsonLd, bodyContentHtml }) {
  let html = SHELL_HTML;

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeCanonical = escapeHtml(canonicalUrl);

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="${safeDescription}" />`
  );
  html = html.replace(
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta property="og:type"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:type" content="article" />`
  );
  html = html.replace(
    /<meta property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${safeCanonical}" />`
  );
  html = html.replace(
    /<meta property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${safeDescription}" />`
  );
  html = html.replace(
    /<meta property="og:image"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:image" content="${safeImage}" />`
  );
  html = html.replace(
    /<meta name="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta name="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:description" content="${safeDescription}" />`
  );
  html = html.replace(
    /<meta name="twitter:image"\s+content="[^"]*"\s*\/>/,
    `<meta name="twitter:image" content="${safeImage}" />`
  );

  // نضيف JSON-LD خاص بهذه الصفحة (Article/SoftwareApplication) بجانب
  // JSON-LD العام للموقع (Organization) الموجود أصلاً — لا نحذفه.
  html = html.replace(
    '</head>',
    `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`
  );

  // حقن المحتوى المرئي داخل #root — React يستبدله لاحقاً بعد تحميل JS.
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root">${bodyContentHtml}</div>`
  );

  return html;
}

function writePage(relativeDir, html) {
  const distTarget = resolve(DIST, relativeDir, 'index.html');
  mkdirSync(dirname(distTarget), { recursive: true });
  writeFileSync(distTarget, html, 'utf-8');

  // نسخة متتبَّعة بـgit للمراجعة اليدوية (راجع التحذير أعلى الملف).
  const trackedTarget = resolve(GENERATED_TRACKED_DIR, relativeDir, 'index.html');
  mkdirSync(dirname(trackedTarget), { recursive: true });
  writeFileSync(trackedTarget, html, 'utf-8');
}

// -------------------------------------------------------------------------
// توليد صفحات المشاريع
// -------------------------------------------------------------------------

async function generateProjectPages() {
  const projects = await fetchTable('projects');
  let count = 0;

  for (const project of projects) {
    const title = `${project.title || project.name} | ${SITE_NAME}`;
    const description = truncate(project.description || project.struggle_story || '', 160);
    const image = absoluteUrl(project.cover);
    const canonicalUrl = `${SITE_URL}/projects/${project.id}`;

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title || project.name,
      description,
      image,
      url: canonicalUrl,
      inLanguage: 'ar',
      ...(project.latest_version ? { softwareVersion: project.latest_version } : {}),
    };

    const bodyContentHtml = `
      <main style="max-width:720px;margin:0 auto;padding:24px;font-family:Tajawal,sans-serif;color:#e8e0d6;background:#0E0C0A;min-height:100vh;">
        <h1 style="font-family:Cairo,sans-serif;">${escapeHtml(project.title || project.name)}</h1>
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(project.title || project.name)}" style="max-width:100%;border-radius:12px;margin:16px 0;" />` : ''}
        <p>${escapeHtml(description)}</p>
      </main>
    `.trim();

    const html = buildPage({ title, description, image, canonicalUrl, jsonLd, bodyContentHtml });
    writePage(`projects/${project.id}`, html);
    count += 1;
  }

  console.log(`[generate-pages] تم توليد ${count} صفحة مشروع.`);
}

// -------------------------------------------------------------------------
// توليد صفحات المنشورات
// -------------------------------------------------------------------------

async function generatePostPages() {
  const posts = await fetchTable('posts');
  let count = 0;

  for (const post of posts) {
    const title = `${post.title} | ${SITE_NAME}`;
    const description = truncate(post.excerpt || post.content || '', 160);
    const image = absoluteUrl(post.cover || '');
    const canonicalUrl = `${SITE_URL}/blog/${post.id}`;
    const publishedTime = post.date ? new Date(post.date).toISOString() : '';
    const publishedHuman = post.date
      ? new Date(post.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
      : '';

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description,
      image,
      url: canonicalUrl,
      datePublished: publishedTime || undefined,
      inLanguage: 'ar',
      author: { '@type': 'Organization', name: SITE_NAME },
    };

    const bodyContentHtml = `
      <main style="max-width:720px;margin:0 auto;padding:24px;font-family:Tajawal,sans-serif;color:#e8e0d6;background:#0E0C0A;min-height:100vh;">
        <h1 style="font-family:Cairo,sans-serif;">${escapeHtml(post.title)}</h1>
        <p style="opacity:.7;font-size:.9em;">${escapeHtml(publishedHuman)}</p>
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}" style="max-width:100%;border-radius:12px;margin:16px 0;" />` : ''}
        <p>${escapeHtml(description)}</p>
      </main>
    `.trim();

    let html = buildPage({ title, description, image, canonicalUrl, jsonLd, bodyContentHtml });
    if (publishedTime) {
      html = html.replace(
        '</head>',
        `  <meta property="article:published_time" content="${escapeHtml(publishedTime)}" />\n  </head>`
      );
    }

    writePage(`blog/${post.id}`, html);
    count += 1;
  }

  console.log(`[generate-pages] تم توليد ${count} صفحة منشور.`);
}

// -------------------------------------------------------------------------

async function main() {
  if (existsSync(GENERATED_TRACKED_DIR)) {
    rmSync(GENERATED_TRACKED_DIR, { recursive: true, force: true });
  }
  await generateProjectPages();
  await generatePostPages();
}

main().catch((err) => {
  console.error('[generate-pages] خطأ غير متوقع:', err);
  process.exit(1);
});
