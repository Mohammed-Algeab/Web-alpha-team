import { Link } from 'react-router-dom';
import { HelpCircle, Users, Map } from 'lucide-react';
import type { Settings } from '@/types';

interface FooterProps {
  settings: Settings | null;
  // ponytail: نفس إصلاح Header.tsx — مطابقة Record<string, boolean> الفعلي
  features: Record<string, boolean>;
}

export default function Footer({ settings, features }: FooterProps) {
  const quickLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/projects', label: 'المشاريع' },
    { to: '/blog', label: 'المدونة' },
    { to: '/downloads', label: 'التحميلات' },
    { to: '/glossary', label: 'المصطلحات' },
    { to: '/roadmap', label: 'خارطة الطريق', icon: Map },
    { to: '/about', label: 'عن الفريق' },
    { to: '/contact', label: 'التواصل' },
  ];

  if (features.faq_page) {
    quickLinks.push({ to: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle });
  }

  if (features.join_team_page) {
    quickLinks.push({ to: '/join', label: 'انضم للفريق', icon: Users });
  }

  return (
    <footer style={{ borderTop: '1px solid rgba(var(--bronze-rgb), 0.1)', padding: 'clamp(36px, 6vw, 52px) 20px 28px' }}>
      <div className="container-limit mx-auto">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: 40,
          marginBottom: 36,
        }}
          className="footer-grid"
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7,
                background: 'rgba(var(--bronze-rgb), 0.14)', border: '1px solid rgba(var(--bronze-rgb), 0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, color: 'var(--bronze)'
              }}>α</div>
              <span style={{ fontWeight: 700, color: 'var(--bronze)', fontSize: '0.95rem' }}>{settings?.site_name || 'فريق ألفا للتعريب'}</span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.38)', lineHeight: 1.75, maxWidth: 260 }}>
              {settings?.tagline || 'نُعرِّب ما تحبه — بالعربية التي تستحقه. فريق يؤمن بأن الترجمة فن لا مجرد نقل كلمات.'}
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--bronze)', marginBottom: 14 }}>روابط سريعة</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {quickLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.38)', textDecoration: 'none' }}
                  className="footer-link-hover"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--bronze)', marginBottom: 14 }}>تابعنا</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {settings?.telegram_channel && (
                <a
                  href={settings.telegram_channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.38)', textDecoration: 'none' }}
                  className="footer-link-hover"
                >
                  قناة التيليغرام
                </a>
              )}
              {settings?.telegram_group && (
                <a
                  href={settings.telegram_group}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.38)', textDecoration: 'none' }}
                  className="footer-link-hover"
                >
                  مجموعة التيليغرام
                </a>
              )}
              {settings?.email && (
                <a
                  href={`mailto:${settings.email}`}
                  style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.38)', textDecoration: 'none' }}
                  className="footer-link-hover"
                >
                  {settings.email}
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(var(--bronze-rgb), 0.07)', paddingTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          className="footer-bottom"
        >
          <span style={{ fontSize: '0.73rem', color: 'rgba(var(--text-rgb), 0.22)' }}>© {new Date().getFullYear()} {settings?.site_name || 'فريق ألفا للتعريب'}</span>
          <span style={{ fontSize: '0.73rem', color: 'rgba(var(--bronze-rgb), 0.3)' }}>صُنع بـ ♥ لمحبي الألعاب البصرية</span>
        </div>
      </div>
      <style>{`
        .footer-link-hover { transition: color 0.2s ease; }
        .footer-link-hover:hover { color: var(--bronze) !important; }
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
