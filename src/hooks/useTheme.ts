// src/hooks/useTheme.ts
// Light/Dark mode toggle with system preference support
// ponytail: alpha-dark is default; theme stored in localStorage
import { useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

const STORAGE_KEY = 'alpha-theme';

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch { /* ignore */ }
  return 'dark';
}

export function setStoredTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* ignore */ }
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('light', !prefersDark);
    root.classList.toggle('dark', prefersDark);
  } else {
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
  }
}

export function initTheme(): Theme {
  const theme = getStoredTheme();
  applyTheme(theme);
  return theme;
}

export function useTheme() {
  // ponytail: كانت theme تُقرأ مباشرة من localStorage بدون useState، فـsetTheme()
  // كانت تُغيّر الكلاس على <html> (يعمل بصرياً) لكن لا تُجبر React على إعادة
  // الـrender — فالزر نفسه يبقى "عالقاً" على الاختيار القديم بصرياً، رغم أن
  // ألوان الموقع تتغيّر فعلياً عبر CSS. الفرق في توقيت HMR/StrictMode بين
  // dev وbuild كان يُظهر هذا العطل بشكل غير متّسق.
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  return {
    theme,
    setTheme: (t: Theme) => {
      setStoredTheme(t);
      applyTheme(t);
      setThemeState(t);
    },
  };
}

// ponytail: يقرأ الكلاس الفعلي المُطبَّق على <html> بدل القيمة المخزَّنة في
// localStorage مباشرة — مهم خاصة عند theme === 'system'، حيث القيمة المخزَّنة
// لا تخبرنا أي وضع بصري طُبِّق فعلياً. يُستخدم لتمرير الوضع الصحيح لـgiscus.
export function getAppliedTheme(): 'dark' | 'light' {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}
