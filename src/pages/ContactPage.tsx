import { ExternalLink, Mail, MessageCircle, Send } from 'lucide-react';
import type { Settings } from '@/types';

interface ContactPageProps {
  settings: Settings | null;
}

const CONTACT_METHODS = [
  {
    key: 'telegram_channel',
    label: 'قناة التيليغرام',
    desc: 'آخر الأخبار والإصدارات',
    icon: <MessageCircle size={22} />,
  },
  {
    key: 'telegram_group',
    label: 'مجموعة التيليغرام',
    desc: 'للنقاش والدعم والاستفسارات',
    icon: <Send size={22} />,
  },
  {
    key: 'email',
    label: 'البريد الإلكتروني',
    desc: 'للمراسلات الرسمية',
    icon: <Mail size={22} />,
  },
];

export default function ContactPage({ settings }: ContactPageProps) {
  const hasContact = settings?.telegram_channel || settings?.telegram_group || settings?.email;

  return (
    <div className="min-h-screen" style={{ paddingTop: 62, paddingBottom: 64 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>نحن هنا من أجلك</span>
        </div>
        <div className="a-section-label">— التواصل</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>تواصل </span>
          <span className="gold-text">معنا</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          نحن هنا للإجابة على استفساراتك. تواصل معنا عبر أي من القنوات التالية.
        </p>
      </div>

      {/* Contact Cards */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 20px' }}>
        {hasContact ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {CONTACT_METHODS.map((method) => {
              const link = method.key === 'email' ? `mailto:${settings?.email}` : settings ? (settings as unknown as Record<string, string>)[method.key] : undefined;
              if (!link) return null;

              return (
                <a
                  key={method.key}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="a-card contact-card"
                  style={{
                    padding: '22px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'rgba(var(--bronze-rgb), 0.12)',
                      border: '1px solid rgba(var(--bronze-rgb), 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--bronze)',
                      flexShrink: 0,
                    }}
                  >
                    {method.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', fontFamily: 'Cairo, sans-serif', marginBottom: 3 }}>
                      {method.label}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(var(--text-rgb), 0.4)' }}>
                      {method.desc}
                    </p>
                  </div>
                  <ExternalLink size={16} style={{ color: 'rgba(var(--bronze-rgb), 0.5)', flexShrink: 0 }} />
                </a>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لم يتم إضافة معلومات تواصل بعد.
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 40,
            padding: '32px 28px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(var(--bronze-rgb), 0.08) 0%, rgba(var(--bronze-rgb), 0.03) 100%)',
            border: '1px solid rgba(var(--bronze-rgb), 0.18)',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: 'Cairo, sans-serif' }}>
            هل تريد الانضمام للفريق؟
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb), 0.45)', marginBottom: 18, lineHeight: 1.7 }}>
            نبحث دائماً عن مواهب جديدة في الترجمة والبرمجة والتصميم.
          </p>
          <a
            href={settings?.telegram_group || 'https://t.me/AlphaTeamChat'}
            target="_blank"
            rel="noopener noreferrer"
            className="a-btn-primary"
            style={{ textDecoration: 'none' }}
          >
            انضم الآن
          </a>
        </div>
      </div>

      <style>{`
        .contact-card { transition: all 0.3s ease; }
        .contact-card:hover { border-color: rgba(var(--bronze-rgb), 0.35) !important; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(var(--bronze-rgb), 0.08); }
      `}</style>
    </div>
  );
}
