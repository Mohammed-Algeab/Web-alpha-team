// functions/_shared/og.js
//
// ponytail: مشترك بين functions/share/projects/[id].js و functions/share/blog/[id].js
// (الاسم يبدأ بـ"_" حتى لا تتعرف Cloudflare Pages عليه كـroute مستقل).
//
// هذا الملف يحل مشكلة OG meta tags لموقع SPA بـHashRouter دون أي توليد ثابت
// وقت البناء — البيانات تُجلب من Supabase "live" وقت الطلب نفسه (Edge Function)،
// فتعمل فوراً لأي مشروع/منشور جديد بمجرد إضافته من لوحة الإدارة، بدون أي إعادة
// بناء أو نشر يدوي للموقع.
//
// المنطق:
// 1. بوت (giscus, Discordbot, TelegramBot, Twitterbot, facebookexternalhit...)
//    → نبني HTML ثابت فيه meta tags صحيحة من بيانات Supabase الحقيقية، نرجعه
//      مباشرة. البوت لا يشغّل JS فلا يحتاج إعادة توجيه أصلاً.
// 2. زائر إنسان (متصفح حقيقي) → تحويل HTTP فوري (302) لرابط الموقع الحقيقي
//    بصيغة Hash (#/projects/123)، فلا يلاحظ أي فرق في تجربته.

const BOT_USER_AGENT_PATTERN =
  /bot|crawl|spider|facebookexternalhit|telegrambot|discordbot|twitterbot|whatsapp|slackbot|linkedinbot|giscus|embedly|quora link preview|outbrain|pinterest|vkshare|skypeuripreview|yandex|baiduspider/i;

export function isBotRequest(userAgent) {
  return BOT_USER_AGENT_PATTERN.test(userAgent || '');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const DEFAULT_DESCRIPTION = 'نُعرِّب ما تحبه — بالعربية التي تستحقه';

export function buildOgHtml({ siteUrl, title, description, image, shareUrl, hashUrl }) {
  const safeTitle = escapeHtml(title || 'فريق ألفا للتعريب');
  const safeDescription = escapeHtml(description || DEFAULT_DESCRIPTION);
  const safeImage = escapeHtml(image || `${siteUrl}/images/logo.png`);
  const safeShareUrl = escapeHtml(shareUrl);
  const safeHashUrl = escapeHtml(hashUrl);

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, follow" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}" />
  <link rel="canonical" href="${safeShareUrl}" />

  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="فريق ألفا للتعريب" />
  <meta property="og:url" content="${safeShareUrl}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDescription}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDescription}" />
  <meta name="twitter:image" content="${safeImage}" />
</head>
<body>
  <p style="font-family: sans-serif; padding: 20px;">
    <a href="${safeHashUrl}">${safeTitle}</a>
  </p>
</body>
</html>`;
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // كاش قصير: بيانات Supabase قد تتغيّر (تعديل وصف، تغيير صورة)، فلا نريد
      // CDN يخزّن نسخة قديمة طويلاً، لكن نسمح بكاش بسيط لتخفيف الحمل.
      'cache-control': 'public, max-age=300, s-maxage=300',
    },
  });
}

export function redirectResponse(location) {
  return new Response(null, {
    status: 302,
    headers: { location },
  });
}
