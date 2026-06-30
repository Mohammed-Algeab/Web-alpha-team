import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import type { FAQItem } from '@/types';

interface FAQPageProps {
  faq: FAQItem[];
  enabled: boolean;
}

function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="a-card faq-item"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: `1px solid ${isOpen ? 'rgba(var(--bronze-rgb), 0.3)' : 'rgba(var(--bronze-rgb), 0.12)'}`,
            }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text)',
                fontFamily: 'Cairo, sans-serif',
                fontWeight: 700,
                fontSize: '0.92rem',
                textAlign: 'right',
              }}
            >
              <span>{item.question}</span>
              <ChevronDown
                size={18}
                style={{
                  color: 'rgba(var(--bronze-rgb), 0.6)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.3s ease',
                  flexShrink: 0,
                  marginRight: 12,
                }}
              />
            </button>
            <div
              style={{
                maxHeight: isOpen ? 500 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.35s ease, padding 0.3s ease',
                padding: isOpen ? '0 20px 16px' : '0 20px',
              }}
            >
              <p style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.8 }}>
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FAQPage({ faq, enabled }: FAQPageProps) {
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
          <span>{faq.length} سؤال</span>
        </div>
        <div className="a-section-label">— الأسئلة الشائعة</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>أسئلة </span>
          <span className="gold-text">متكررة</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          إجابات على الأسئلة الأكثر شيوعاً حول فريق ألفا وعملية التعريب
        </p>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 20px' }}>
        {faq.length > 0 ? (
          <FAQAccordion items={faq} />
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد أسئلة حالياً.
          </div>
        )}
      </div>

      <style>{`
        .faq-item { transition: all 0.3s ease; }
        .faq-item:hover { border-color: rgba(var(--bronze-rgb), 0.25) !important; }
      `}</style>
    </div>
  );
}
