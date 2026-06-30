import { useState } from 'react';

import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types';
import { assetUrl } from '@/lib/assetUrl';

interface ProjectsPageProps {
  projects: Project[];
}

const TYPES = ['الكل', 'تعريب', 'أداة', 'لعبة'];
const STATUSES = ['الكل', 'جاري العمل', 'مكتمل', 'قادم قريباً', 'متوقف'];
const STATUS_MAP: Record<string, string> = {
  'جاري العمل': 'active',
  'مكتمل': 'completed',
  'قادم قريباً': 'upcoming',
  'متوقف': 'paused',
};
const STATUS_CLASS: Record<string, string> = {
  active: 'a-status-active',
  completed: 'a-status-completed',
  upcoming: 'a-status-upcoming',
  paused: 'a-status-paused',
};

export default function ProjectsPage({ projects }: ProjectsPageProps) {
  const [typeFilter, setTypeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter((p) => {
    const typeMatch = typeFilter === 'الكل' || p.type === typeFilter;
    const statusMatch = statusFilter === 'الكل' || p.status === STATUS_MAP[statusFilter];
    return typeMatch && statusMatch;
  });

  return (
    <div className="min-h-screen" style={{ paddingTop: 62 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{projects.length} مشروع</span>
        </div>
        <div className="a-section-label">— مشاريعنا</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>كل </span>
          <span className="gold-text">التعريبات</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          مشاريع التعريب التي نعتز بها — من الألعاب البصرية إلى الأنيمي والأدوات
        </p>
      </div>

      {/* Filters */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 32px' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>النوع:</span>
          {TYPES.map((t) => (
            <button key={t} className={`a-tag${typeFilter === t ? ' active' : ''}`} onClick={() => setTypeFilter(t)}>
              {t}
            </button>
          ))}
          <div style={{ width: 1, height: 24, background: 'rgba(var(--bronze-rgb), 0.15)', margin: '0 8px' }} />
          <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>الحالة:</span>
          {STATUSES.map((s) => (
            <button key={s} className={`a-tag${statusFilter === s ? ' active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
          <div style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 7,
                  border: `1px solid ${view === v ? 'rgba(var(--bronze-rgb), 0.4)' : 'rgba(var(--bronze-rgb), 0.15)'}`,
                  background: view === v ? 'rgba(var(--bronze-rgb), 0.08)' : 'transparent',
                  cursor: 'pointer',
                  color: view === v ? 'var(--bronze)' : 'rgba(var(--text-rgb), 0.3)',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {v === 'grid' ? '▦' : '☰'}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.3)' }}>{filtered.length} نتيجة</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        {view === 'grid' ? (
          <div className="projects-pg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {filtered.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((p) => (
              <div
                key={p.id}
                className="project-list-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  borderRadius: 12,
                  border: '1px solid rgba(var(--bronze-rgb), 0.1)',
                  background: 'rgba(14,12,10,0.8)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                <img
                  src={p.cover}
                  alt={p.title || p.name}
                  style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, filter: 'brightness(0.7)', flexShrink: 0 }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = assetUrl('/images/placeholder.webp');
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.title || p.name}</span>
                    <span className={`a-status ${STATUS_CLASS[p.status] || 'a-status-active'}`}>
                      {p.status === 'active' ? 'جاري العمل' : p.status === 'completed' ? 'مكتمل' : p.status === 'upcoming' ? 'قادم' : 'متوقف'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.45)' }}>{p.description}</p>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.1rem', color: p.status === 'completed' ? 'var(--success)' : 'var(--bronze)' }}>
                    {p.progress}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(var(--text-rgb), 0.3)' }}>{p.type}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد مشاريع مطابقة للفلترة المحددة.
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .projects-pg-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .projects-pg-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .project-list-item:hover {
          border-color: rgba(var(--bronze-rgb), 0.25) !important;
          background: rgba(14,12,10,0.95) !important;
        }
      `}</style>
    </div>
  );
}
