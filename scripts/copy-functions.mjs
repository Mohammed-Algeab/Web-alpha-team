// scripts/copy-functions.mjs
//
// ponytail: مهم جداً — هذا المشروع يُنشر برفع مجلد dist/ نفسه إلى GitHub
// (وليس رفع الكود المصدري وترك Cloudflare تبنيه). فـCloudflare Pages تتعرف
// على مجلد "functions/" فقط إذا كان موجوداً بجذر المحتوى المنشور — وبما أن
// المحتوى المنشور هو dist/ نفسه، فـfunctions/ (الموجود بجذر مشروع web/،
// بجانب src/) لا يصل لـCloudflare أبداً إلا إذا نسخناه يدوياً داخل dist/
// بعد كل build. بدون هذه الخطوة، روابط /share/projects/:id و /share/blog/:id
// ترجع 404 على الموقع المنشور فعلياً، حتى لو الكود سليم 100% محلياً.
//
// يعمل تلقائياً بعد "pnpm build" (راجع package.json: "postbuild").

import { cpSync, existsSync, rmSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '../functions');
const DEST = resolve(__dirname, '../dist/functions');

if (!existsSync(SRC)) {
  console.warn('[copy-functions] مجلد functions/ غير موجود — تخطّي.');
  process.exit(0);
}

if (existsSync(DEST)) {
  rmSync(DEST, { recursive: true, force: true });
}

cpSync(SRC, DEST, { recursive: true });
console.log('[copy-functions] تم نسخ functions/ إلى dist/functions بنجاح.');
