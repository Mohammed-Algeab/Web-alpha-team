// functions/share/blog/[id].js
//
// المسار: https://<site>/share/blog/:id — نفس منطق functions/share/projects/[id].js
// لكن لجدول posts. راجع التعليقات هناك للتفاصيل الكاملة.

import { isBotRequest, buildOgHtml, htmlResponse, redirectResponse } from '../../_shared/og.js';

export async function onRequestGet({ request, params, env }) {
  const { id } = params;
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '');
  const shareUrl = `${siteUrl}/share/blog/${id}`;
  const hashUrl = `${siteUrl}/#/blog/${id}`;

  const userAgent = request.headers.get('user-agent');

  if (!isBotRequest(userAgent)) {
    return redirectResponse(hashUrl);
  }

  try {
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

    const res = await fetch(
      `${supabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(id)}&select=title,excerpt`,
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
    const post = rows?.[0];

    if (!post) {
      return htmlResponse(
        buildOgHtml({ siteUrl, title: 'فريق ألفا للتعريب', shareUrl, hashUrl }),
        404
      );
    }

    return htmlResponse(
      buildOgHtml({
        siteUrl,
        title: post.title,
        description: post.excerpt,
        shareUrl,
        hashUrl,
      })
    );
  } catch (err) {
    return htmlResponse(
      buildOgHtml({ siteUrl, title: 'فريق ألفا للتعريب', shareUrl, hashUrl })
    );
  }
}
