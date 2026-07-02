# دليل التنفيذ — تحويل صفحات المشاريع/المنشورات إلى HTML حقيقي + إلغاء Hash Router

هذا الدليل خاص بمستودع **web** (`Web-alpha-team`) فقط. مشروع **pwa** لم يُلمَس إطلاقًا.

---

## 1) أين تضع كل ملف داخل مستودعك

```
web/
├── src/main.tsx                          ← استبدل بالكامل (BrowserRouter + إصلاح href)
├── src/pages/ProjectDetailPage.tsx       ← استبدل بالكامل (رابط مشاركة مباشر بدل /share/)
├── src/pages/PostDetailPage.tsx          ← استبدل بالكامل (نفس السبب)
├── scripts/generate-pages.mjs            ← ملف جديد، ضعه بجانب scripts/copy-functions.mjs
├── package.json                          ← عدّل فقط سطر "postbuild" (راجع package-patch/scripts-section.json)
└── .github/workflows/generate-pages.yml  ← ملف جديد (المسار من جذر المستودع، ليس داخل web/)
```

> ⚠️ `.github/workflows/` يجب أن يكون في **جذر المستودع** (بجانب مجلد `web/`)، وليس داخل `web/`، لأن GitHub Actions يبحث عنه هناك فقط.

بعد وضع الملفات، افتح `package.json` وغيّر سطر واحد فقط:
```json
"postbuild": "node scripts/copy-functions.mjs && node scripts/generate-pages.mjs",
```

لا تحتاج تلمس أي ملف آخر — كل باقي المشروع (المكونات، الصفحات الأخرى، إلخ) يبقى كما هو تمامًا.

---

## 2) إضافة GitHub Secrets (خطوة بخطوة)

الـ Secrets هي متغيرات سرّية (مفاتيح API) يستخدمها الـ workflow أثناء البناء، بدون أن تظهر لأي أحد في الكود أو السجلّات.

1. افتح مستودعك على GitHub: `github.com/Mohammed-Algeab/Web-alpha-team`
2. **Settings** (أعلى يمين الصفحة) → من القائمة الجانبية: **Secrets and variables** → **Actions**
3. اضغط **New repository secret** وأضف كل واحد من التالي (اسم القيمة بالضبط، ثم القيمة نفسها):

| الاسم (Name) | من وين تجيبها |
|---|---|
| `VITE_SUPABASE_URL` | نفس القيمة الموجودة حاليًا في ملف `.env` المحلي عندك |
| `VITE_SUPABASE_ANON_KEY` | نفسها من `.env` المحلي |
| `VITE_SITE_URL` | نفسها من `.env` المحلي (رابط الموقع الفعلي) |
| `VITE_PWA_URL` | نفسها من `.env` المحلي |
| `CLOUDFLARE_API_TOKEN` | من لوحة Cloudflare (خطوات بالأسفل) |
| `CLOUDFLARE_ACCOUNT_ID` | من لوحة Cloudflare (خطوات بالأسفل) |
| `CLOUDFLARE_PAGES_PROJECT_NAME` | اسم مشروع Pages نفسه في Cloudflare (تجده أعلى صفحة المشروع في لوحة Cloudflare) |

بعد إضافة كل واحد تضغط **Add secret** وتنتقل للتالي. لا تحتاج تلمس `GITHUB_TOKEN` — GitHub يوفره تلقائيًا لكل workflow.

### كيف تجيب CLOUDFLARE_API_TOKEN و CLOUDFLARE_ACCOUNT_ID
1. سجّل دخول [dash.cloudflare.com](https://dash.cloudflare.com)
2. **CLOUDFLARE_ACCOUNT_ID**: موجود في الشريط الجانبي الأيمن لأي صفحة داخل حسابك (Account ID)، انسخه مباشرة.
3. **CLOUDFLARE_API_TOKEN**: من أيقونة حسابك (أعلى يمين) → **My Profile** → **API Tokens** → **Create Token** → اختر القالب **"Edit Cloudflare Workers"** أو أنشئ توكن مخصص بصلاحية **Cloudflare Pages → Edit** على حسابك. انسخ التوكن فور ظهوره (يظهر مرة واحدة فقط).

---

## 3) ضبط Supabase Database Webhook (يخلي Supabase "يطلب" من GitHub إعادة التوليد)

هذه هي الخطوة اللي تحقق طلبك الأصلي: أي إضافة/تعديل بجدول `projects` أو `posts` يشعل تلقائيًا إعادة بناء ونشر.

### أولاً: أنشئ GitHub Personal Access Token (يُستخدم من طرف Supabase فقط، لا يوضع في GitHub Secrets)
1. على GitHub: صورتك الشخصية (أعلى يمين) → **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens** → **Generate new token**
2. الصلاحية المطلوبة فقط: **Repository access → Only select repositories → Web-alpha-team**، ثم **Permissions → Contents: Read and write** (هذا يكفي لتفعيل repository_dispatch).
3. انسخ التوكن الناتج — ستحتاجه في Supabase مباشرة (خطوة تالية)، وليس في GitHub.

### ثانيًا: أنشئ الـ Webhook في Supabase
1. افتح مشروعك في [supabase.com/dashboard](https://supabase.com/dashboard) → **Database** → **Webhooks** → **Create a new hook**
2. **Name**: `notify-github-projects`
3. **Table**: `projects`
4. **Events**: فعّل `Insert` و `Update` (اترك `Delete` معطّل إلا لو تبي حذف المشروع يعيد التوليد أيضًا — فعّله لو حبيت)
5. **Type**: HTTP Request
6. **Method**: POST
7. **URL**: 
   ```
   https://api.github.com/repos/Mohammed-Algeab/Web-alpha-team/dispatches
   ```
8. **HTTP Headers**، أضف اثنين:
   ```
   Authorization: Bearer <التوكن الذي نسخته بالخطوة السابقة>
   Accept: application/vnd.github+json
   Content-Type: application/json
   ```
9. **HTTP Body**:
   ```json
   {"event_type": "supabase-content-updated"}
   ```
10. احفظ.
11. **كرّر نفس الخطوات بالضبط لجدول `posts`** (webhook ثانٍ منفصل، بنفس الـURL والـHeaders والـBody — فقط غيّر **Name** و **Table**).

بهذا: أي تعديل على مشروع أو منشور من لوحة الإدارة → Supabase يستدعي GitHub → GitHub Actions يبني وينشر تلقائيًا خلال دقيقة إلى دقيقتين تقريبًا.

---

## 4) اختبار محلي قبل الرفع (اختياري لكن يُنصح به)

```bash
cd web
pnpm install
pnpm build
# افتح dist/projects/<ضع أي id حقيقي هنا>/index.html في المتصفح مباشرة
# أو افحص المحتوى مباشرة:
cat dist/projects/<id>/index.html | head -50
```

لو ظهرت رسالة `VITE_SUPABASE_URL أو VITE_SUPABASE_ANON_KEY غير مضبوطين` تأكد أن ملف `.env` المحلي عندك فيه القيم الصحيحة (Vite يحمّله تلقائيًا، لكن `generate-pages.mjs` سكربت Node عادي — استخدم: `node --env-file=.env scripts/generate-pages.mjs` بعد البناء لو ما اشتغل تلقائيًا).

---

## 5) بعد التفعيل — تنظيف اختياري

بما أن `/projects/:id` و `/blog/:id` أصبحا يخدمان HTML حقيقي كامل ببيانات OG صحيحة مباشرة، مسار `/share/projects/:id` و `/share/blog/:id` (في `functions/share/`) لم يعد له داعٍ — كان حلاً بديلاً مؤقتًا لمشكلة hash router. تقدر تحذف `functions/share/` و `functions/_shared/og.js` لاحقًا بعد التأكد أن كل شيء يشتغل صح، أو تتركها كما هي بدون ضرر (لن تُستدعى من أي مكان بالموقع بعد تحديث `CopyLinkButton`/`OGMetaTags`).

---

## 6) حدود هذا الحل (بصراحة)

- الصفحات المولّدة تشمل فقط **تفاصيل المشروع/المنشور** (`/projects/:id`, `/blog/:id`) — بقية الصفحات (`/projects`, `/blog`, `/about`...) تبقى SPA عادية تُقرأ بواسطة React، وهذا كافٍ لأن جوجل ينفّذ JS لمعظم الحالات، والمحتوى الأهم أصلاً بصفحات التفاصيل.
- أي **تعديل يدوي** على ملف داخل `generated-pages/` سيُستبدل تلقائيًا في أول تشغيل تالٍ للـworkflow. لو تبي عنوان/وصف SEO مخصص فعليًا، أضف أعمدة مثل `meta_title` و `meta_description` في جدولي `projects`/`posts` في Supabase، واستخدمها داخل `generate-pages.mjs` بدل الحقول الافتراضية (تعديل بسيط لسطرين في السكربت أقدر أساعدك فيه لاحقًا لو حبيت).
- تحديث المحتوى ليس فوريًا 100% — يعتمد على وقت تشغيل GitHub Actions (عادة أقل من دقيقتين).
