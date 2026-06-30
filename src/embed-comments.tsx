// src/embed-comments.tsx — صفحة مستقلة لعرض giscus داخل WebView (team-apk)
// ponytail: لا Router، لا useData()، لا Header/Footer — فقط مكوّن واحد خفيف.
// التطبيق (team-apk) يفتح هذه الصفحة بـ:
//   https://alphateam.app/embed-comments.html?term=<رابط share نظيف>&theme=dark
//                                              &title=...&description=...&image=...
// وعند تبديل المشروع المعروض في التطبيق، يغيّر فقط رابط WebView نفسه —
// لا حاجة لأي postMessage أو تواصل JS بين React Native والصفحة.
//
// title/description/image (اختيارية): تُحقن كـmeta tags في document.head قبل
// تحميل مكوّن Giscus. هذا مهم فقط في حالة واحدة: كون هذا أول فتح لهذا term
// على الإطلاق من أي مصدر (تطبيق أو موقع) — حينها GitHub يستخدم meta tags
// الصفحة الحالية (هذه الصفحة، داخل WebView، تعمل كمتصفح كامل ينفّذ JS) لبناء
// عنوان/وصف أول Discussion تلقائياً. إن كانت الـDiscussion موجودة مسبقاً
// (أنشأها الموقع أو التطبيق من قبل)، فلا تأثير لهذه القيم على الإطلاق.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GiscusComments } from '@/components/GiscusComments';
import './index.css';

function getQueryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function setMetaTag(property: string, content: string, attr: 'name' | 'property' = 'property') {
  let tag = document.querySelector(`meta[${attr}="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function injectMetaFromParams() {
  const title = getQueryParam('title');
  const description = getQueryParam('description');
  const image = getQueryParam('image');
  const term = getQueryParam('term'); // رابط /share/ النظيف نفسه، يُستخدم كـog:url

  if (title) {
    document.title = title;
    setMetaTag('og:title', title);
    setMetaTag('twitter:title', title, 'name');
  }
  if (description) {
    setMetaTag('description', description, 'name');
    setMetaTag('og:description', description);
    setMetaTag('twitter:description', description, 'name');
  }
  if (image) {
    setMetaTag('og:image', image);
    setMetaTag('twitter:image', image, 'name');
  }
  if (term) {
    setMetaTag('og:url', term);
  }
}

function EmbedCommentsPage() {
  const term = getQueryParam('term');
  const themeParam = getQueryParam('theme'); // 'dark' | 'light' من التطبيق
  const theme = themeParam === 'light' ? 'alpha-light' : 'alpha-dark';

  // ponytail: نطبّق كلاس .light على html نفسها — نفس آلية الموقع الرئيسي
  // (راجع hooks/useTheme.ts)، حتى تتفاعل متغيرات index.css بشكل صحيح هنا أيضاً.
  if (themeParam === 'light') {
    document.documentElement.classList.add('light');
  }

  injectMetaFromParams();

  if (!term) {
    return (
      <div style={{ padding: 20, fontFamily: 'Cairo, sans-serif', color: 'var(--error)' }}>
        رابط غير صحيح: المعامل term مطلوب (مثال: ?term=project:123)
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', padding: '12px' }}>
      <GiscusComments term={term} theme={theme} />
    </div>
  );
}

createRoot(document.getElementById('embed-root')!).render(
  <StrictMode>
    <EmbedCommentsPage />
  </StrictMode>
);
