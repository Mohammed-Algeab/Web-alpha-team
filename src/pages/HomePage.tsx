import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Smartphone, Wifi, Zap, Monitor } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';
import GearDecoration from '@/components/GearDecoration';
import type { Project, Post, Independent, Settings } from '@/types';
import OGMetaTags from '@/components/OGMetaTags';
import { PWA_URL } from '@/lib/pwaUrl';

interface HomePageProps {
  settings: Settings | null;
  projects: Project[];
  posts: Post[];
  independent: Independent[];
}

function StatCard({ stat, index }: { stat: { label: string; value: string; suffix: string }; index: number }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className="a-stat-widget"
      style={{
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: `all 0.6s ease ${index * 0.1}s`,
      }}
    >
      <div style={{
        fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
        fontWeight: 900,
        lineHeight: 1,
        background: 'linear-gradient(135deg, var(--bronze), #F0D080)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {stat.value}{stat.suffix}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.45)', marginTop: 6 }}>{stat.label}</div>
    </div>
  );
}

export default function HomePage({ settings, projects, posts, independent }: HomePageProps) {
  // Stats
  const completedProjects = projects.filter(p => p.progress === 100).length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const totalDownloads = projects.reduce((acc, p) => acc + (('download_count' in p ? (p as Record<string, unknown>).download_count : 0) as number || 0), 0);

  const STATS = [
    { label: 'مشروع مكتمل', value: String(completedProjects || 0), suffix: '+' },
    { label: 'مشروع نشط', value: String(activeProjects || 0), suffix: '' },
    { label: 'تحميل', value: totalDownloads > 1000 ? `${(totalDownloads / 1000).toFixed(1)}K` : String(totalDownloads || 0), suffix: '' },
    { label: 'مشروع', value: String(projects.length || 0), suffix: '' },
  ];

  // V5: Featured projects sorted by display_order, show top 3
  const featuredProjects = projects
    .filter(p => p.featured)
    .sort((x, y) => (x.display_order ?? 0) - (y.display_order ?? 0));
  const top3Featured = featuredProjects.slice(0, 3);
  const hasMoreFeatured = featuredProjects.length > 3;

  // Fallback: if no featured projects, show first 3 active projects
  const displayProjects = top3Featured.length > 0 ? top3Featured : projects.filter(p => p.status === 'active').slice(0, 3);

  const latestPosts = [...posts].sort((p1, p2) => new Date(p2.date).getTime() - new Date(p1.date).getTime()).slice(0, 3);
  const latestIndependent = [...independent].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);

  // ponytail: لاحظنا في الإنتاج أن settings.tagline كان مطابقاً حرفياً لعنوان
  // الـ H1 أعلاه ("نُعرّب ما تحبه بالعربية التي تستحقه")، فتظهر نفس الجملة
  // مرتين متتاليتين في الهيرو. هذا فحص دفاعي: إن كان الـ tagline القادم من
  // الإعدادات يكرر عنوان الـ H1 (بإزالة المسافات/علامات الترقيم للمقارنة)
  // نتجاهله ونستخدم نص وصفي مختلف بدلاً منه.
  const FALLBACK_TAGLINE = 'فريق متخصص في تعريب الألعاب البصرية والروايات المرئية اليابانية — نحمل روح الأصل ونُلبسها العربية بأناقة وأمانة.';
  const normalize = (s: string) => s.replace(/[\s—–\-،,.؛:]/g, '');
  const heroH1Text = 'نُعرِّبماتحبهبالعربيةالتيتستحقه';
  const taglineMatchesH1 = settings?.tagline && normalize(settings.tagline) === normalize(heroH1Text);
  const heroTagline = !settings?.tagline || taglineMatchesH1 ? FALLBACK_TAGLINE : settings.tagline;

  return (
    <div>
      <OGMetaTags
        title={settings?.site_name || 'فريق ألفا للتعريب'}
        description={settings?.site_description || settings?.tagline || 'نُعرِّب ما تحبه — بالعربية التي تستحقه'}
        keywords={settings?.keywords || undefined}
      />

      {/* ===== HERO ===== */}
      <section className="hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Decorative gears */}
        <div className="absolute top-10 left-10 opacity-20">
          <GearDecoration size={100} variant="main" className="animate-spin-slow" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-15">
          <GearDecoration size={70} variant="small" />
        </div>
        <div className="absolute top-40 left-1/4 opacity-10">
          <GearDecoration size={130} variant="main" />
        </div>

        {/* Glow effects */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 40%, rgba(var(--bronze-rgb), 0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', left: '5%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,100,50,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(100px, 14vw, 130px) 20px clamp(60px, 8vw, 80px)', width: '100%', position: 'relative', zIndex: 1 }}>
          <div className="a-fadein" style={{ maxWidth: 640 }}>
            {/* Badge */}
            <div className="a-badge shine-effect" style={{ marginBottom: 24, padding: '6px 16px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bronze)', boxShadow: '0 0 12px var(--bronze)', animation: 'pulse-dot 2s ease-in-out infinite' }} />
              <span style={{ letterSpacing: '0.02em', fontWeight: 700 }}>مشاريع التعريب العربي الاحترافي</span>
            </div>

            {/* H1 */}
            <h1 style={{
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: '-0.03em',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontFamily: 'Cairo, sans-serif',
            }}>
              <span style={{ color: 'var(--text)', textShadow: '0 0 30px rgba(var(--text-rgb), 0.1)' }}>نُعرِّب ما </span>
              <span className="gold-text" style={{ filter: 'drop-shadow(0 0 20px rgba(var(--bronze-rgb), 0.3))' }}>تحبه</span>
              <br />
              <span style={{ color: 'var(--text)' }}>بالعربية التي </span>
              <span style={{ color: 'rgba(var(--text-rgb), 0.25)', fontStyle: 'italic' }}>تستحقه</span>
            </h1>

            <p style={{ fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', lineHeight: 1.8, color: 'rgba(var(--text-rgb), 0.52)', marginBottom: 36, maxWidth: 520 }}>
              {heroTagline}
            </p>

            <div className="hero-buttons" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/projects" className="a-btn-primary" style={{ textDecoration: 'none' }}>
                استعرض المشاريع
              </Link>
              <Link to="/about" className="a-btn-outline" style={{ textDecoration: 'none' }}>
                عن الفريق
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, opacity: 0.35 }}>
          <div style={{ width: 1, height: 36, background: 'linear-gradient(to bottom, transparent, rgba(var(--bronze-rgb), 0.8))' }} />
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--bronze)' }} />
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ padding: '44px 20px', borderTop: '1px solid rgba(var(--bronze-rgb), 0.08)', borderBottom: '1px solid rgba(var(--bronze-rgb), 0.08)', background: 'rgba(var(--bronze-rgb), 0.02)' }}>
        <div className="container-limit mx-auto">
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PROJECTS ===== */}
      {displayProjects.length > 0 && (
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 20px' }}>
          <div className="container-limit mx-auto">
            <div className="section-header" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div className="a-section-label">— مشاريعنا</div>
                <h2 className="a-section-h">
                  <span style={{ color: 'var(--text)' }}>أبرز </span>
                  <span className="gold-text">التعريبات</span>
                </h2>
              </div>
              {hasMoreFeatured && (
                <Link to="/featured" className="a-btn-outline" style={{ padding: '9px 20px', fontSize: '0.85rem', textDecoration: 'none' }}>
                  جميع المشاريع ←
                </Link>
              )}
            </div>
            <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {displayProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== LATEST POSTS ===== */}
      {latestPosts.length > 0 && (
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 20px', background: 'rgba(var(--bronze-rgb), 0.02)', borderTop: '1px solid rgba(var(--bronze-rgb), 0.07)' }}>
          <div className="container-limit mx-auto">
            <div className="section-header" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div className="a-section-label">— المدونة</div>
                <h2 className="a-section-h">
                  <span style={{ color: 'var(--text)' }}>آخر </span>
                  <span className="gold-text">التحديثات</span>
                </h2>
              </div>
              <Link to="/blog" className="a-btn-outline" style={{ padding: '9px 20px', fontSize: '0.85rem', textDecoration: 'none' }}>
                عرض الكل ←
              </Link>
            </div>
            <div className="posts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {latestPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== INDEPENDENT TRANSLATIONS ===== */}
      {latestIndependent.length > 0 && (
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 20px' }}>
          <div className="container-limit mx-auto">
            <div className="section-header" style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div className="a-section-label">— تعريبات مستقلة</div>
                <h2 className="a-section-h">
                  <span style={{ color: 'var(--text)' }}>جهود </span>
                  <span className="gold-text">مستقلة</span>
                </h2>
              </div>
              <Link to="/independent" className="a-btn-outline" style={{ padding: '9px 20px', fontSize: '0.85rem', textDecoration: 'none' }}>
                عرض الكل ←
              </Link>
            </div>
            <div className="indep-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {latestIndependent.map((item) => (
                <div
                  key={item.id}
                  className="a-card"
                  style={{ padding: '20px 22px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="a-tag" style={{ cursor: 'default' }}>{item.type}</span>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(var(--text-rgb), 0.3)' }}>
                      {new Date(item.date).toLocaleDateString('en-US')}
                    </span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(var(--text-rgb), 0.4)', marginBottom: 16 }}>
                    المُعرب: {'translator' in item ? (item as Record<string, unknown>).translator as string || item.name : item.name}
                  </p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="a-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '10px 18px', textDecoration: 'none' }}
                  >
                    <span>تحميل التعريب</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section style={{ padding: 'clamp(48px, 8vw, 72px) 20px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div
            className="cta-inner"
            style={{
              padding: '52px 44px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, rgba(var(--bronze-rgb), 0.08) 0%, rgba(var(--bronze-rgb), 0.03) 100%)',
              border: '1px solid rgba(var(--bronze-rgb), 0.18)',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--bronze-rgb), 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 2rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 14, lineHeight: 1.3, fontFamily: 'Cairo, sans-serif' }}>
                هل أنت شغوف بالترجمة؟
              </h2>
              <p style={{ fontSize: 'clamp(0.85rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.48)', marginBottom: 30, maxWidth: 460, margin: '0 auto 30px', lineHeight: 1.75 }}>
                نبحث دائماً عن مواهب جديدة تشاركنا الشغف بالتعريب الاحترافي. انضم إلى عائلة ألفا.
              </p>
              <Link to="/join" className="a-btn-primary" style={{ padding: '13px 34px', fontSize: '0.95rem', textDecoration: 'none' }}>
                انضم إلى الفريق
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section style={{ padding: 'clamp(24px, 4vw, 48px) 20px', borderTop: '1px solid rgba(var(--bronze-rgb), 0.08)' }}>
        <div className="container-limit mx-auto text-center">
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'Cairo, sans-serif', marginBottom: 20 }}>
            <span className="gold-text">انضم لمجتمعنا</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
            {settings?.telegram_channel && (
              <a
                href={settings.telegram_channel}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>قناة التيليغرام</span>
                <ExternalLink size={14} />
              </a>
            )}
            {settings?.telegram_group && (
              <a
                href={settings.telegram_group}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn-outline"
                style={{ textDecoration: 'none' }}
              >
                <span>مجموعة التيليغرام</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ===== App Promo Section ===== */}
      <section style={{ padding: '60px 0' }}>
        <div className="container-limit mx-auto px-4 sm:px-6">
          <div
            className="a-card app-promo-card"
            style={{
              padding: '40px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: 36,
              flexWrap: 'wrap',
            }}
          >
            {/* أيقونة كبيرة */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 20,
                flexShrink: 0,
                background: 'linear-gradient(135deg, var(--bronze), #F0D080)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 28px rgba(var(--bronze-rgb), 0.3)',
              }}
            >
              <Smartphone size={40} color="#0E0C0A" />
            </div>

            {/* نص + مميزات */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <p className="a-section-label" style={{ marginBottom: 6 }}>— تجربة أسرع</p>
              <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 800, fontSize: 'clamp(1.15rem, 2.4vw, 1.5rem)', marginBottom: 10, color: 'var(--text)' }}>
                لدينا أيضاً{' '}
                <span className="gold-text">تطبيق</span>
                {' '}— يعمل على هاتفك وحاسوبك معاً
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.8, marginBottom: 18, maxWidth: 560 }}>
                نفس المحتوى، بتجربة أسرع وأقرب لتطبيق حقيقي: يفتح فوراً، يعمل حتى بدون إنترنت، ومصمم ليشتغل بسلاسة سواء على الجوال أو الحاسوب.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 22 }}>
                {[
                  { icon: Zap, text: 'فتح فوري' },
                  { icon: Wifi, text: 'يعمل أوفلاين' },
                  { icon: Monitor, text: 'هاتف وحاسوب' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.6)' }}>
                    <Icon size={14} style={{ color: 'var(--bronze)', flexShrink: 0 }} />
                    {text}
                  </div>
                ))}
              </div>

              {/* <a> عادي وليس <Link> — رابط الـPWA المستقل (PWA_URL) خارج
                  نطاق هذا الـHashRouter بالكامل (راجع ملاحظة AppButton.tsx
                  لتفاصيل سبب عدم مناسبة Link هنا أصلاً) */}
              <a
                href={PWA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn-primary"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <Smartphone size={15} />
                <span>افتح التطبيق</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .cta-inner { padding: 36px 24px !important; }
          .section-header { flex-direction: column; align-items: flex-start !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .projects-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .posts-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .indep-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .app-promo-card { padding: 28px 20px !important; gap: 20px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .projects-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .posts-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .indep-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
