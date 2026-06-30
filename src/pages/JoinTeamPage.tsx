import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Users, ExternalLink, FileText, Languages, Gamepad2, Code, Sparkles } from 'lucide-react';
import type { Settings } from '@/types';

interface JoinTeamPageProps {
  settings: Settings | null;
  enabled: boolean;
}

const ROLES = [
  {
    icon: <FileText size={22} />,
    title: 'مترجم',
    description: 'ترجمة النصوص من اليابانية أو الإنجليزية إلى العربية بأسلوب سلس ودقيق.',
  },
  {
    icon: <Languages size={22} />,
    title: 'مراجع لغوي',
    description: 'مراجعة النصوص المترجمة والتأكد من الدقة اللغوية والنحوية والسياقية.',
  },
  {
    icon: <Gamepad2 size={22} />,
    title: 'مختبر',
    description: 'اختبار التعريب داخل اللعبة والتأكد من ظهور النصوص بشكل صحيح.',
  },
  {
    icon: <Code size={22} />,
    title: 'مطور',
    description: 'برمجة أدوات التعريب والباتشات وحل المشاكل التقنية.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'مصمم',
    description: 'تصميم الواجهات والخطوط والأصول البصرية للتعريب.',
  },
  {
    icon: <Users size={22} />,
    title: 'منسق',
    description: 'تنسيق العمل بين أعضاء الفريق ومتابعة التقدم.',
  },
];

export default function JoinTeamPage({ settings, enabled }: JoinTeamPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!enabled) {
      navigate('/', { replace: true });
    }
  }, [enabled, navigate]);

  if (!enabled) return null;

  return (
    <div className="min-h-screen" style={{ paddingTop: 62, paddingBottom: 64 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>انضم إلينا</span>
        </div>
        <div className="a-section-label">— الفريق</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span className="gold-text">انضم </span>
          <span style={{ color: 'var(--text)' }}>للفريق</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          فريق ألفا للتعريب هو فريق متطوع يعمل على تعريب الألعاب والروايات البصرية — انضم إلينا!
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Intro */}
        <div
          className="a-card"
          style={{
            padding: '28px 32px',
            marginBottom: 40,
            maxWidth: 800,
            background: 'linear-gradient(135deg, rgba(var(--bronze-rgb), 0.08) 0%, rgba(var(--bronze-rgb), 0.03) 100%)',
            border: '1px solid rgba(var(--bronze-rgb), 0.18)',
          }}
        >
          <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', marginBottom: 10 }}>
            عن العمل في الفريق
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.85 }}>
            فريق ألفا للتعريب هو فريق متطوع يعمل على تعريب الألعاب والروايات البصرية إلى اللغة العربية.
            نبحث دائماً عن أعضاء جدود يشاركوننا الشغف نفسه. العمل مرن ويتم عن بُعد، ولا يتطلب
            خبرة احترافية — فقط الجدية والالتزام.
          </p>
        </div>

        {/* Roles */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="a-section-label">— الأدوار</div>
          <h2 className="a-section-h" style={{ fontSize: '1.5rem' }}>
            <span style={{ color: 'var(--text)' }}>الأدوار </span>
            <span className="gold-text">المطلوبة</span>
          </h2>
        </div>
        <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 48 }}>
          {ROLES.map((role) => (
            <div
              key={role.title}
              className="a-card role-card"
              style={{ padding: '24px 20px', textAlign: 'center' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(var(--bronze-rgb), 0.12)',
                  border: '1px solid rgba(var(--bronze-rgb), 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--bronze)',
                  margin: '0 auto 14px',
                }}
              >
                {role.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 8, fontFamily: 'Cairo, sans-serif' }}>
                {role.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.45)', lineHeight: 1.7 }}>
                {role.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            maxWidth: 600,
            margin: '0 auto',
            padding: '40px 32px',
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
            <h2 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 12, fontFamily: 'Cairo, sans-serif' }}>
              هل أنت مهتم بالانضمام؟
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb), 0.48)', marginBottom: 24, lineHeight: 1.75 }}>
              تواصل معنا عبر تيليغرام وسنرشدك للخطوات القادمة.
            </p>
            <a
              href={settings?.telegram_group || 'https://t.me/AlphaTeamChat'}
              target="_blank"
              rel="noopener noreferrer"
              className="a-btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <span>تواصل عبر تيليغرام</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .role-card { transition: all 0.3s ease; }
        .role-card:hover { border-color: rgba(var(--bronze-rgb), 0.3) !important; transform: translateY(-3px); box-shadow: 0 12px 32px rgba(var(--bronze-rgb), 0.08); }
        @media (max-width: 768px) {
          .roles-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
        }
        @media (max-width: 480px) {
          .roles-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
