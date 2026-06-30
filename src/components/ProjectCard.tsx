import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

const statusLabels: Record<string, string> = {
  active: 'جاري العمل',
  completed: 'مكتمل',
  upcoming: 'قادم قريباً',
  paused: 'متوقف',
};

const statusClasses: Record<string, string> = {
  active: 'a-status-active',
  completed: 'a-status-completed',
  upcoming: 'a-status-upcoming',
  paused: 'a-status-paused',
};

function CardProgressBar({ progress, isCompleted }: { progress: number; isCompleted: boolean }) {
  const [width, setWidth] = useState(0);
  useState(() => {
    const t = setTimeout(() => setWidth(progress), 400);
    return () => clearTimeout(t);
  });

  return (
    <div className="a-progress-track">
      <div
        className={`a-progress-fill${isCompleted ? ' done' : ''}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const statusLabel = statusLabels[project.status] || project.status;
  const statusClass = statusClasses[project.status] || 'a-status-active';
  const isCompleted = project.status === 'completed';
  // hasCover: تجنب تطبيق تعتيم brightness على placeholder الداكنة
  // (التي كانت تبدو كمساحة سوداء فاضية تماماً حين تُعتَّم إضافياً).
  const hasCover = !!project.cover && !imgError && !project.cover.includes('placeholder');

  return (
    <div
      className="a-card"
      style={{
        border: `1px solid ${hovered ? 'rgba(var(--bronze-rgb), 0.45)' : 'rgba(var(--bronze-rgb), 0.12)'}`,
        background: 'var(--card-surface)',
        transition: 'all 0.35s ease',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 24px 60px rgba(var(--bronze-rgb), 0.12)'
          : '0 4px 20px rgba(0,0,0,0.18)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        {hasCover ? (
          <img
            src={project.cover}
            alt={project.title || project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              filter: 'brightness(0.65)',
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder بصري: حرف أول من الاسم بدل مساحة فاضية */
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card-surface)',
          }}>
            <span style={{
              fontSize: '3.5rem',
              fontWeight: 900,
              color: 'rgba(var(--bronze-rgb), 0.2)',
              fontFamily: 'Cairo, sans-serif',
              userSelect: 'none',
            }}>
              {(project.title || project.name || '؟').charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient overlay — يُطبّق فقط على غلاف حقيقي */}
        {hasCover && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,8,6,0.9) 0%, rgba(10,8,6,0.15) 60%, transparent 100%)',
          }} />
        )}
        {/* Status badge */}
        <span className={`a-status ${statusClass}`} style={{ position: 'absolute', top: 12, right: 12 }}>
          {statusLabel}
        </span>
        {/* Type badge */}
        <span style={{
          position: 'absolute',
          bottom: 10,
          right: 12,
          fontSize: '0.68rem',
          padding: '3px 8px',
          borderRadius: 6,
          border: '1px solid rgba(var(--bronze-rgb), 0.3)',
          background: 'rgba(10,8,6,0.65)',
          color: 'rgba(var(--bronze-rgb), 0.85)',
          backdropFilter: 'blur(4px)',
        }}>
          {project.type}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text)' }}>
              {project.title || project.name}
            </div>
            {(() => {
              const titleEn = 'title_en' in project ? String((project as Record<string, unknown>).title_en || '') : '';
              return titleEn ? (
                <div style={{ fontSize: '0.72rem', color: 'rgba(var(--bronze-rgb), 0.65)', marginTop: 2 }}>
                  {titleEn}
                </div>
              ) : null;
            })()}
          </div>
          <span style={{
            fontWeight: 900,
            fontSize: '1.15rem',
            color: isCompleted ? 'var(--success)' : 'var(--bronze)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {project.progress}%
          </span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
          {project.description}
        </p>

        <CardProgressBar progress={project.progress} isCompleted={isCompleted} />

        <Link
          to={`/projects/${project.id}`}
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--bronze)',
            opacity: hovered ? 1 : 0.6,
            transition: 'opacity 0.3s ease',
            textDecoration: 'none',
          }}
        >
          <span>اكتشف المزيد</span>
          <ArrowLeft size={14} />
        </Link>
      </div>
    </div>
  );
}
