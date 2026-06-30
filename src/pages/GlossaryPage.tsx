import { useState, useMemo } from 'react';
import type { GlossaryItem, Project } from '@/types';

interface GlossaryPageProps {
  glossary: GlossaryItem[];
  projects: Project[];
}

export default function GlossaryPage({ glossary, projects }: GlossaryPageProps) {
  const [filterProject, setFilterProject] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filterProject === 'all') return glossary;
    return glossary.filter((g) => g.project_id === filterProject);
  }, [glossary, filterProject]);

  const projectNames = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => {
      map[p.id] = p.name;
    });
    return map;
  }, [projects]);

  return (
    <div className="min-h-screen" style={{ paddingTop: 62, paddingBottom: 64 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{glossary.length} مصطلح</span>
        </div>
        <div className="a-section-label">— المعجم</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span className="gold-text">مصطلحات </span>
          <span style={{ color: 'var(--text)' }}>التعريب</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          قائمة المصطلحات وترجماتها المستخدمة في مشاريع الفريق
        </p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        {/* Project Filter */}
        {projects.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>المشروع:</span>
              <button
                onClick={() => setFilterProject('all')}
                className={`a-tag${filterProject === 'all' ? ' active' : ''}`}
              >
                الكل
              </button>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFilterProject(p.id)}
                  className={`a-tag${filterProject === p.id ? ' active' : ''}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.3)', marginTop: 12 }}>
              {filtered.length} مصطلح
            </p>
          </div>
        )}

        {/* Glossary Table */}
        {filtered.length > 0 ? (
          <div className="glossary-table-shell" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(var(--bronze-rgb), 0.1)' }}>
            {/* Desktop/tablet: real table */}
            <div className="glossary-table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="a-table">
                <thead>
                  <tr style={{ background: 'rgba(var(--bronze-rgb), 0.04)' }}>
                    <th>المصطلح الأصلي</th>
                    <th>الترجمة العربية</th>
                    <th>السبب</th>
                    <th>المشروع</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="glossary-row">
                      <td style={{ fontWeight: 600, color: 'var(--text)' }}>{item.term_original}</td>
                      <td style={{ fontWeight: 700, color: 'var(--bronze)', fontFamily: 'Cairo, sans-serif' }}>
                        {item.term_arabic}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'rgba(var(--text-rgb), 0.5)' }}>
                        {item.reason || '—'}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.45)' }}>
                        {item.project_id ? projectNames[item.project_id] || '—' : 'عام'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card layout */}
            <div className="glossary-card-list">
              {filtered.map((item) => (
                <div key={item.id} className="gl-card">
                  <div className="gl-card-row">
                    <span className="gl-card-original">{item.term_original}</span>
                    <span className="gl-card-arabic">{item.term_arabic}</span>
                  </div>
                  {item.reason && (
                    <p className="gl-card-reason">{item.reason}</p>
                  )}
                  <span className="gl-card-project">
                    {item.project_id ? projectNames[item.project_id] || '—' : 'عام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد مصطلحات مطابقة للفلترة المحددة.
          </div>
        )}
      </div>

      <style>{`
        .glossary-row { transition: background 0.2s; }
        .glossary-row:hover td { background: rgba(var(--bronze-rgb), 0.03); }

        .glossary-card-list { display: none; }

        @media (max-width: 640px) {
          .glossary-table-wrapper { display: none; }
          .glossary-table-shell { border: none; }
          .glossary-card-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .gl-card {
            border: 1px solid rgba(var(--bronze-rgb), 0.12);
            border-radius: 12px;
            padding: 14px 16px;
            background: rgba(var(--bronze-rgb), 0.02);
          }
          .gl-card-row {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 6px;
          }
          .gl-card-original {
            font-weight: 600;
            color: var(--text);
            font-size: 0.88rem;
          }
          .gl-card-arabic {
            font-weight: 700;
            color: var(--bronze);
            font-family: Cairo, sans-serif;
            font-size: 0.95rem;
          }
          .gl-card-reason {
            font-size: 0.78rem;
            color: rgba(var(--text-rgb), 0.5);
            margin: 0 0 8px;
          }
          .gl-card-project {
            font-size: 0.72rem;
            color: rgba(var(--text-rgb), 0.4);
          }
        }
      `}</style>
    </div>
  );
}
