// functions/share/projects/[id].js
//
// المسار: https://<site>/share/projects/:id
// يُستدعى عند كل طلب (Cloudflare Pages Function، تعمل عند الطلب وليس وقت
// البناء) — يجلب بيانات المشروع "live" من Supabase، فيعمل فوراً حتى لمشروع
// أُضيف هذه اللحظة من لوحة الإدارة، بدون أي إعادة بناء أو نشر للموقع.
//
// متغيرات البيئة المطلوبة (تُضبط من لوحة Cloudflare Pages → Settings →
// Environment variables — نفس قيم web/.env):
//   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_SITE_URL

import { isBotRequest, buildOgHtml, htmlResponse, redirectResponse } from '../../_shared/og.js';

export async function onRequestGet({ request, params, env }) {
  const { id } = params;
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '');
  const shareUrl = `${siteUrl}/share/projects/${id}`;
  const hashUrl = `${siteUrl}/#/projects/${id}`;

  const userAgent = request.headers.get('user-agent');

  // زائر إنسان عادي: تحويل فوري، لا حاجة لاستعلام Supabase أصلاً (أسرع).
  if (!isBotRequest(userAgent)) {
    return redirectResponse(hashUrl);
  }

  // بوت (giscus, Telegram, WhatsApp...): نحتاج بيانات المشروع الحقيقية.
  try {
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/projects?id=eq.${encodeURIComponent(id)}&select=title,description,cover`,
      {
        headers: {
          apikey: supabaseAnonKey,
          authorization: `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Supabase responded ${res.status}`);
    }

    const rows = await res.json();
    const project = rows?.[0];

    if (!project) {
      // مشروع غير موجود (محذوف مثلاً) — صفحة OG عامة بدل خطأ فادح.
      return htmlResponse(
        buildOgHtml({ siteUrl, title: 'فريق ألفا للتعريب', shareUrl, hashUrl }),
        404
      );
    }

    return htmlResponse(
      buildOgHtml({
        siteUrl,
        title: project.title,
        description: project.description,
        image: project.cover,
        shareUrl,
        hashUrl,
      })
    );
  } catch (err) {
    // فشل الاتصال بـSupabase لا يجب أن يكسر تجربة البوت كلياً — نرجع صفحة
    // عامة سليمة بدل خطأ 500 صريح.
    return htmlResponse(
      buildOgHtml({ siteUrl, title: 'فريق ألفا للتعريب', shareUrl, hashUrl })
    );
  }
}
