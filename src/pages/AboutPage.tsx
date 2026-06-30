import { useRef, useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import Timeline from '@/components/Timeline';
import GearDecoration from '@/components/GearDecoration';
import type { TeamMember, Project, Settings, CreditItem } from '@/types';

interface AboutPageProps {
  settings: Settings | null;
  team: TeamMember[];
  projects: Project[];
  credits: CreditItem[];
  features: {
    credits_section: boolean;
  };
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
      style={{
        padding: '20px 16px',
        borderRadius: 12,
        textAlign: 'center',
        background: 'rgba(var(--bronze-rgb), 0.04)',
        border: '1px solid rgba(var(--bronze-rgb), 0.1)',
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

export default function AboutPage({ settings, team, projects, credits, features }: AboutPageProps) {
  const completedProjects = projects.filter((p) => p.progress === 100);
  const activeProjects = projects.filter((p) => p.status === 'active');

  const timelineFromProjects = [...projects]
    .filter((p) => p.created_at)
    .map((p) => ({
      date: p.created_at,
      version: p.name,
      notes: `بدء المشروع - ${p.type}`,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const STATS = [
    { label: 'مشروع', value: String(projects.length), suffix: '' },
    { label: 'نشط', value: String(activeProjects.length), suffix: '' },
    { label: 'مكتمل', value: String(completedProjects.length), suffix: '' },
    { label: 'عضو', value: String(team.length), suffix: '' },
  ];

  return (
    <div className="min-h-screen" style={{ paddingTop: 80 }}>
      <div className="container-limit mx-auto" style={{ padding: '0 20px 60px' }}>
        {/* Hero */}
        <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 20, paddingBottom: 40 }}>
          <div className="a-badge" style={{ marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            <span>من نحن</span>
          </div>
          <div className="a-section-label">— عن الفريق</div>
          <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
            <span style={{ color: 'var(--text)' }}>نُعرِّب ما </span>
            <span className="gold-text">تحبه</span>
            <span style={{ color: 'var(--text)' }}> بالعربية التي تستحقه</span>
          </h1>
          <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
            فريق ألفا للتعريب — فريق متخصص في تعريب الألعاب البصرية والروايات المرئية اليابانية بأعلى معايير الجودة.
          </p>
        </div>

        {/* Stats */}
        <div className="about-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 60 }}>
          {STATS.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
        </div>

        {/* Story & Mission */}
        <section style={{ marginBottom: 60 }}>
          <div className="about-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            <div className="a-card" style={{ padding: 28, position: 'relative' }}>
              <div className="absolute top-4 left-4 opacity-20">
                <GearDecoration size={80} variant="small" />
              </div>
              <div className="a-section-label">— قصتنا</div>
              <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 14 }}>
                بداية الرحلة
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.85 }}>
                {settings
                  ? `بدأ فريق ${settings.site_name} رحلته من شغف بجعل الألعاب والروايات البصرية متاحة باللغة العربية. نؤمن أن اللغة العربية تستحق محتوى عالي الجودة، وأن الترجمة فن يجب احترامه.`
                  : 'بدأ فريق ألفا للتعريب رحلته من شغف بجعل الألعاب والروايات البصرية متاحة باللغة العربية. نؤمن أن اللغة العربية تستحق محتوى عالي الجودة، وأن الترجمة فن يجب احترامه.'}
              </p>
            </div>
            <div className="a-card" style={{ padding: 28 }}>
              <div className="a-section-label">— مهمتنا</div>
              <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 14 }}>
                رسالتنا
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.85 }}>
                نسعى لتعريب الألعاب والروايات البصرية بأعلى معايير الجودة. هدفنا ليس فقط الترجمة، بل نقل الثقافة والإحساس والروح الأصلية للعمل إلى العربية.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="a-section-label">— فريقنا</div>
            <h2 className="a-section-h">
              <span style={{ color: 'var(--text)' }}>أشخاص يضعون </span>
              <span className="gold-text">قلوبهم</span>
              <span style={{ color: 'var(--text)' }}> في العمل</span>
            </h2>
          </div>
          <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {team.map((member) => (
              <div
                key={member.id}
                className="a-card team-card"
                style={{ padding: '26px 18px', textAlign: 'center' }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(var(--bronze-rgb), 0.18), rgba(var(--bronze-rgb), 0.05))',
                    border: '2px solid rgba(var(--bronze-rgb), 0.28)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    overflow: 'hidden',
                  }}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--bronze)' }}>
                      {member.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 4, fontFamily: 'Cairo, sans-serif' }}>
                  {member.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(var(--bronze-rgb), 0.6)' }}>
                  {member.role}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Credits Section */}
        {features.credits_section && credits.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div className="a-section-label">— تقدير</div>
              <h2 className="a-section-h">
                <span style={{ color: 'var(--text)' }}>الشكر والـ</span>
                <span className="gold-text">تقدير</span>
              </h2>
            </div>
            <div className="a-card" style={{ padding: 28 }}>
              <div className="credits-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {credits.map((credit) => (
                  <div key={credit.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bronze)', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)', fontFamily: 'Cairo, sans-serif' }}>
                        {credit.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(var(--text-rgb), 0.4)' }}>
                        {credit.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline */}
        {timelineFromProjects.length > 0 && (
          <section style={{ marginBottom: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div className="a-section-label">— التاريخ</div>
              <h2 className="a-section-h">
                <span style={{ color: 'var(--text)' }}>مسيرة </span>
                <span className="gold-text">المشاريع</span>
              </h2>
            </div>
            <div className="a-card" style={{ padding: 28 }}>
              <Timeline items={timelineFromProjects} />
            </div>
          </section>
        )}

        {/* Join CTA */}
        <section style={{ padding: '0 0 40px' }}>
          <div style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: '44px 36px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(var(--bronze-rgb), 0.08) 0%, rgba(var(--bronze-rgb), 0.03) 100%)',
            border: '1px solid rgba(var(--bronze-rgb), 0.18)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(var(--bronze-rgb), 0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 14, lineHeight: 1.3, fontFamily: 'Cairo, sans-serif' }}>
                انضم للفريق
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'rgba(var(--text-rgb), 0.48)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.75 }}>
                هل لديك شغف بالترجمة أو البرمجة أو التصميم؟ نحن نبحث دائماً عن أعضاء جدد.
              </p>
              <a
                href={settings?.telegram_group || 'https://t.me/AlphaTeamChat'}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn-primary"
                style={{ textDecoration: 'none' }}
              >
                <span>تواصل معنا</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .team-card { transition: all 0.3s ease; }
        .team-card:hover { border-color: rgba(var(--bronze-rgb), 0.3) !important; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(var(--bronze-rgb), 0.08); }
        @media (max-width: 768px) {
          .about-grid-2 { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
          .about-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .credits-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .team-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
