import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Gamepad2, BookOpen, Download, Users, Search,
  HelpCircle, Phone, Cog, BookMarked, Shield, Menu, X,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AppButton from './AppButton';
import { assetUrl } from '@/lib/assetUrl';

const baseNavLinks = [
  { to: '/', label: 'الرئيسية', icon: Gamepad2 },
  { to: '/projects', label: 'المشاريع', icon: Cog },
  { to: '/blog', label: 'المدونة', icon: BookOpen },
  { to: '/downloads', label: 'التحميلات', icon: Download },
  { to: '/independent', label: 'تعريبات مستقلة', icon: Users },
  { to: '/glossary', label: 'المصطلحات', icon: BookMarked },
  { to: '/search', label: 'البحث', icon: Search },
  { to: '/about', label: 'عن الفريق', icon: HelpCircle },
  { to: '/contact', label: 'التواصل', icon: Phone },
];

interface HeaderProps {
  // ponytail: كان نوعاً حرفياً ضيقاً ({faq_page, join_team_page} فقط) غير متوافق
  // مع SiteFeatures الفعلي (Record<string, boolean>) من useSiteFeatures() — كان
  // يفشل بناء الويب (tsc) من الأصل. الإصلاح: مطابقة مصدر الحقيقة الفعلي للنوع.
  features: Record<string, boolean>;
  isAdmin?: boolean;
}

// Easter egg: 1 in 1000 chance to show the numbered logo
// DevTools: اكتب في Console قبل ما تفتح الـ sidebar:
//   window.__egg = true   ← تشغيل
//   delete window.__egg   ← إيقاف (أو مجرد Refresh)
const isEasterEgg =
  (window as Window & { __egg?: boolean }).__egg === true ||
  Math.random() < 0.001;

export default function Header({ features, isAdmin }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Build nav links with conditional items
  const navLinks = [...baseNavLinks];
  if (features.faq_page) {
    navLinks.splice(7, 0, { to: '/faq', label: 'الأسئلة الشائعة', icon: HelpCircle });
  }
  if (features.join_team_page) {
    navLinks.splice(navLinks.length - 1, 0, { to: '/join', label: 'انضم للفريق', icon: Users });
  }
  if (isAdmin) {
    navLinks.push({ to: '/admin', label: 'الإدارة', icon: Shield });
  }

  return (
    <>
      {/* ===== Top Header Bar ===== */}
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'var(--header-scrolled-bg)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(var(--bronze-rgb), 0.16)'
            : '1px solid transparent',
        }}
      >
        <div className="container-limit mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo — right side (RTL start) */}
            <Link
              to="/"
              className="flex items-center gap-2.5"
              style={{ flexShrink: 0, textDecoration: 'none' }}
            >
              <img
                src={assetUrl('/images/logo.png')}
                alt="فريق ألفا للتعريب"
                style={{
                  height: 42,
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 8px rgba(var(--bronze-rgb), 0.35))',
                }}
              />
              <span
                className="hidden sm:inline"
                style={{
                  fontFamily: 'Cairo',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  color: 'var(--bronze)',
                }}
              >
                فريق ألفا للتعريب
              </span>
            </Link>

            {/* Theme toggle + زر التطبيق — بجانب زر القائمة مباشرة، ظاهران
                دائماً (ليسا داخل القائمة المنزلقة فقط) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <AppButton variant="header" />
              <ThemeToggle />

              {/* Hamburger — left side (RTL end), opens sidebar from left */}
              <button
                onClick={() => setMenuOpen(true)}
                aria-label="فتح القائمة"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9,
                  border: '1px solid rgba(var(--bronze-rgb), 0.28)',
                  background: 'rgba(var(--bronze-rgb), 0.05)',
                  cursor: 'pointer',
                  color: 'var(--bronze)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--bronze-rgb), 0.12)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--bronze-rgb), 0.5)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(var(--bronze-rgb), 0.05)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--bronze-rgb), 0.28)';
              }}
            >
              <Menu size={19} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Backdrop overlay ===== */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 60,
          background: 'rgba(0,0,0,0.58)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transition: 'opacity 0.28s ease',
        }}
      />

      {/* ===== Sidebar Panel — slides in from LEFT (RTL end side) ===== */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,           /* anchored to left edge */
          bottom: 0,
          width: 'min(280px, calc(100vw - 52px))',
          zIndex: 70,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--nav-panel-bg)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          borderRight: '1px solid var(--nav-panel-border)',  /* border on the RIGHT edge (toward content) */
          transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',  /* slides from left */
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          willChange: 'transform',
        }}
        aria-label="القائمة الجانبية"
      >
        {/* Sidebar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            height: 64,
            borderBottom: '1px solid var(--nav-panel-border)',
            flexShrink: 0,
          }}
        >
          {/* Close button — also on left since sidebar is on left */}
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="إغلاق القائمة"
            style={{
              width: 34,
              height: 34,
              borderRadius: 7,
              border: '1px solid rgba(var(--bronze-rgb), 0.2)',
              background: 'transparent',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--bronze)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--bronze-rgb), 0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(var(--bronze-rgb), 0.2)';
            }}
          >
            <X size={16} />
          </button>

          <span
            style={{
              color: 'var(--bronze)',
              fontWeight: 800,
              fontFamily: 'Cairo',
              fontSize: '0.9rem',
            }}
          >
            التنقل
          </span>
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '10px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`a-btn-ghost${isActive ? ' active' : ''}`}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  textDecoration: 'none',
                  borderRadius: 9,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  /* In RTL: first child (span) on right, Icon on left — natural reading order */
                }}
              >
                <span style={{ flex: 1, textAlign: 'right' }}>{link.label}</span>
                <Icon size={16} style={{ flexShrink: 0 }} />
              </Link>
            );
          })}

          {/* فاصل بسيط + زر التطبيق — منفصل بصرياً عن روابط التنقل
              العادية لأنه ليس صفحة داخل الموقع بل وجهة مختلفة (PWA) */}
          <div style={{ height: 1, background: 'var(--nav-panel-border)', margin: '8px 6px' }} />
          <AppButton variant="sidebar" onClick={() => setMenuOpen(false)} />
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid var(--nav-panel-border)',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <img
            src={assetUrl(isEasterEgg ? '/images/logo-numbered.png' : '/images/logo.png')}
            alt="فريق ألفا للتعريب"
            style={{
              height: isEasterEgg ? 90 : 72,
              width: 'auto',
              objectFit: 'contain',
              opacity: 0.85,
              filter: 'drop-shadow(0 0 6px rgba(var(--bronze-rgb), 0.2))',
              transition: 'height 0.3s ease',
            }}
          />
        </div>
      </aside>
    </>
  );
}
