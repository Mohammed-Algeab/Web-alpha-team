import { ExternalLink, Users, Plus } from 'lucide-react';
import type { Independent, Settings } from '@/types';

interface IndependentPageProps {
  independent: Independent[];
  settings: Settings | null;
}

export default function IndependentPage({ independent, settings }: IndependentPageProps) {
  const sorted = [...independent].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen" style={{ paddingTop: 62, paddingBottom: 64 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{independent.length} تعريب</span>
        </div>
        <div className="a-section-label">— جهود مستقلة</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>التعريبات </span>
          <span className="gold-text">المستقلة</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          تعريبات تم إنجازها من قبل مترجمين مستقلين — نحن ندعم ونروج لهذه الجهود.
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {sorted.length === 0 ? (
          <div
            className="a-card"
            style={{ padding: '48px 24px', textAlign: 'center' }}
          >
            <Users size={48} style={{ color: 'var(--bronze)', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ color: 'rgba(var(--text-rgb), 0.45)' }}>
              لا توجد تعريبات مستقلة حالياً.
            </p>
          </div>
        ) : (
          <div className="indep-pg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {sorted.map((item) => (
              <div
                key={item.id}
                className="a-card indep-card"
                style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="a-tag" style={{ cursor: 'default' }}>{item.type}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(var(--text-rgb), 0.3)' }}>
                    {new Date(item.date).toLocaleDateString('en-US')}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.45)', lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                  {item.description}
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(var(--bronze-rgb), 0.5)', marginBottom: 12 }}>
                    المُعرب: {'translator' in item ? (item as Record<string, unknown>).translator as string || item.name : item.name}
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="a-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    <span>تحميل التعريب</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Suggest Button */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <a
            href={settings?.telegram_group || 'https://t.me/AlphaTeamChat'}
            target="_blank"
            rel="noopener noreferrer"
            className="a-btn-outline"
            style={{ textDecoration: 'none' }}
          >
            <span>اقترح تعريباً</span>
            <Plus size={16} />
          </a>
        </div>
      </div>

      <style>{`
        .indep-card { transition: all 0.3s ease; }
        .indep-card:hover { border-color: rgba(var(--bronze-rgb), 0.35) !important; transform: translateY(-3px); box-shadow: 0 16px 40px rgba(var(--bronze-rgb), 0.1); }
        @media (max-width: 768px) {
          .indep-pg-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .indep-pg-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
