import { Helmet } from 'react-helmet-async';
import { Clock, CheckCircle2, PlayCircle, Hourglass } from 'lucide-react';
import type { Project } from '@/types';

interface RoadmapPageProps {
  projects: Project[];
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  completed: { label: 'مكتمل', icon: <CheckCircle2 size={14} />, color: 'var(--success)', bg: 'rgba(80,200,120,0.12)' },
  active: { label: 'جاري العمل', icon: <PlayCircle size={14} />, color: 'var(--bronze)', bg: 'rgba(var(--bronze-rgb), 0.12)' },
  upcoming: { label: 'قادم قريباً', icon: <Hourglass size={14} />, color: '#6090C0', bg: 'rgba(96,144,192,0.12)' },
  paused: { label: 'متوقف', icon: <Clock size={14} />, color: '#DC503C', bg: 'rgba(220,80,60,0.12)' },
};

const STATUS_ORDER = ['completed', 'active', 'upcoming', 'paused'];

export default function RoadmapPage({ projects }: RoadmapPageProps) {
  const sortedProjects = [...projects].sort((a, b) => {
    const aIndex = STATUS_ORDER.indexOf(a.status);
    const bIndex = STATUS_ORDER.indexOf(b.status);
    if (aIndex !== bIndex) return aIndex - bIndex;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Stats
  const completed = projects.filter(p => p.status === 'completed').length;
  const active = projects.filter(p => p.status === 'active').length;
  const upcoming = projects.filter(p => p.status === 'upcoming').length;

  return (
    <div className="min-h-screen" style={{ paddingTop: 62, paddingBottom: 64 }}>
      <Helmet>
        <title>خارطة الطريق</title>
      </Helmet>

      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{projects.length} مشروع</span>
        </div>
        <div className="a-section-label">— التخطيط</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>خارطة </span>
          <span className="gold-text">طريق الفريق</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          تابع حالة مشاريع التعريب والتخطيط المستقبلي
        </p>
      </div>

      {/* Quick stats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 32px' }}>
        <div className="roadmap-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          {[
            ['مكتمل', String(completed), 'var(--success)'],
            ['جاري العمل', String(active), 'var(--bronze)'],
            ['قادم', String(upcoming), '#6090C0'],
          ].map(([label, value, color]) => (
            <div key={label} className="a-stat-widget" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.4)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              right: 22,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'rgba(var(--bronze-rgb), 0.15)',
              borderRadius: 1,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {sortedProjects.map((project) => {
              const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.active;
              return (
                <div
                  key={project.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    position: 'relative',
                  }}
                >
                  {/* Dot */}
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: config.color,
                      border: `2px solid ${config.bg}`,
                      boxShadow: `0 0 8px ${config.color}40`,
                      flexShrink: 0,
                      marginTop: 18,
                      zIndex: 2,
                    }}
                  />

                  {/* Card */}
                  <div
                    className="a-card roadmap-card"
                    style={{
                      flex: 1,
                      padding: '18px 22px',
                      borderRight: `3px solid ${config.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: config.bg,
                        color: config.color,
                      }}>
                        {config.label}
                      </span>
                      <span className="a-tag" style={{ cursor: 'default' }}>{project.type}</span>
                      <span style={{ fontSize: '0.72rem', color: 'rgba(var(--text-rgb), 0.3)', marginRight: 'auto' }}>
                        {project.progress}%
                      </span>
                    </div>
                    <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)', marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                      {project.title || project.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'rgba(var(--text-rgb), 0.45)', lineHeight: 1.7, marginBottom: 12 }}>
                      {project.description}
                    </p>

                    {/* Progress */}
                    <div className="a-progress-track" style={{ height: 5 }}>
                      <div
                        className="a-progress-fill"
                        style={{
                          width: `${project.progress}%`,
                          background: project.status === 'completed'
                            ? 'linear-gradient(90deg, #50C878, #80E0A0)'
                            : 'linear-gradient(90deg, var(--bronze), #F0D080)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {sortedProjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد مشاريع حالياً.
          </div>
        )}
      </div>

      <style>{`
        .roadmap-card { transition: all 0.3s ease; }
        .roadmap-card:hover { transform: translateX(-4px); box-shadow: 0 12px 32px rgba(var(--bronze-rgb), 0.08); }
        @media (max-width: 768px) {
          .roadmap-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
