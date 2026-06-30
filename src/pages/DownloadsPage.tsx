import { useEffect, useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { Download as DownloadType, Project } from '@/types';

interface DownloadsPageProps {
  downloads: DownloadType[];
  projects: Project[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  stable: { label: 'مستقر', bg: 'rgba(80,200,120,0.12)', color: 'var(--success)' },
  beta: { label: 'تجريبي', bg: 'rgba(var(--bronze-rgb), 0.12)', color: 'var(--bronze)' },
  old: { label: 'قديم', bg: 'rgba(150,150,150,0.1)', color: 'rgba(var(--text-rgb), 0.35)' },
  جديد: { label: 'جديد', bg: 'rgba(80,200,120,0.12)', color: 'var(--success)' },
  'محدّث': { label: 'محدّث', bg: 'rgba(var(--bronze-rgb), 0.12)', color: 'var(--bronze)' },
};

export default function DownloadsPage({ downloads, projects, hasMore, loadingMore, onLoadMore }: DownloadsPageProps) {
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('');
  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasActiveFilter = Boolean(search || projectFilter);

  // Phase 3.1: تحميل تدريجي فقط بدون فلتر نشط (نفس منطق BlogPage)
  useEffect(() => {
    if (hasActiveFilter || !onLoadMore || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) onLoadMore();
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasActiveFilter, onLoadMore, hasMore, loadingMore]);

  const projectNames = useMemo(() => {
    const names: Record<string, string> = {};
    projects.forEach((p) => {
      names[p.id] = p.name;
    });
    return names;
  }, [projects]);

  const filtered = downloads.filter((d) => {
    if (projectFilter && d.project_id !== projectFilter) return false;
    const projectName = projectNames[d.project_id] || '';
    const version = d.changelog?.version || '';
    return (
      projectName.includes(search) ||
      version.includes(search) ||
      d.type.includes(search)
    );
  });

  // Quick stats
  const totalDownloads = downloads.length * 10; // approximation
  const activeCount = downloads.filter((d) => d.status === 'stable' || d.status === 'جديد').length;

  return (
    <div className="min-h-screen" style={{ paddingTop: 62 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{downloads.length} ملف</span>
        </div>
        <div className="a-section-label">— التحميلات</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span className="gold-text">تحميل </span>
          <span style={{ color: 'var(--text)' }}>التعريبات</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          جميع إصدارات فريق ألفا في مكان واحد — دائماً مجانية ودائماً نظيفة
        </p>
      </div>

      {/* Search + Stats */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 32px' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              className="a-input"
              placeholder="ابحث عن ملف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingRight: 40 }}
            />
            <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(var(--text-rgb), 0.3)', fontSize: 15 }}>
              <Search size={16} />
            </span>
          </div>
        </div>

        {/* Project filter chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setProjectFilter('')}
            style={{
              padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
              border: `1px solid ${projectFilter === '' ? 'var(--bronze)' : 'rgba(var(--bronze-rgb), 0.2)'}`,
              background: projectFilter === '' ? 'rgba(var(--bronze-rgb), 0.12)' : 'transparent',
              color: projectFilter === '' ? 'var(--bronze)' : 'rgba(var(--text-rgb), 0.5)',
              cursor: 'pointer',
            }}
          >
            الكل
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setProjectFilter(p.id)}
              style={{
                padding: '6px 14px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 700,
                border: `1px solid ${projectFilter === p.id ? 'var(--bronze)' : 'rgba(var(--bronze-rgb), 0.2)'}`,
                background: projectFilter === p.id ? 'rgba(var(--bronze-rgb), 0.12)' : 'transparent',
                color: projectFilter === p.id ? 'var(--bronze)' : 'rgba(var(--text-rgb), 0.5)',
                cursor: 'pointer',
              }}
            >
              {p.title || p.name}
            </button>
          ))}
        </div>

        {/* Quick stats */}
        <div className="dl-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
          {[
            ['إجمالي التحميلات', `${totalDownloads.toLocaleString('en-US')}+`],
            ['إصدارات نشطة', String(activeCount)],
            ['ملفات متاحة', String(downloads.length)],
          ].map(([k, v]) => (
            <div key={k} className="a-stat-widget">
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--bronze)', fontFamily: 'Cairo, sans-serif' }}>{v}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.4)', marginTop: 4 }}>{k}</div>
            </div>
          ))}
        </div>

        {/* Table — تتحول إلى بطاقات على الموبايل (≤640px) بدل صفوف جدول
            مضغوطة. جدول بـ6 أعمدة لا يتسع بعرض هاتف بدون قص أعمدة أو
            overflow أفقي صامت، فنفس البيانات تُعرض كبطاقة label/value. */}
        <div className="downloads-table-shell" style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(var(--bronze-rgb), 0.1)' }}>
          {/* Desktop/tablet: real table with horizontal scroll fallback */}
          <div className="downloads-table-wrapper" style={{ overflowX: 'auto' }}>
            <table className="a-table">
              <thead>
                <tr style={{ background: 'rgba(var(--bronze-rgb), 0.04)' }}>
                  <th>المشروع</th>
                  <th>الإصدار</th>
                  <th>النوع</th>
                  <th>الحجم</th>
                  <th>الحالة</th>
                  <th>تحميل</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const s = STATUS_STYLE[d.status] || STATUS_STYLE['old'];
                  const pName = projectNames[d.project_id] || d.project_id;
                  return (
                    <tr key={d.id} style={{ transition: 'background 0.2s' }} className="dl-row">
                      <td style={{ fontWeight: 700, color: 'var(--text)' }}>{pName}</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--bronze)', fontSize: '0.82rem' }}>{d.changelog?.version || '-'}</td>
                      <td>{d.type}</td>
                      <td style={{ fontSize: '0.78rem' }}>{'size' in d ? (d as Record<string, unknown>).size as string : '-'}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.68rem', fontWeight: 700, background: s.bg, color: s.color }}>
                          {s.label}
                        </span>
                      </td>
                      <td>
                        <a
                          href={d.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="a-btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          تحميل
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: card layout — كل صف يصبح بطاقة بحقول واضحة بدون قص */}
          <div className="downloads-card-list">
            {filtered.map((d) => {
              const s = STATUS_STYLE[d.status] || STATUS_STYLE['old'];
              const pName = projectNames[d.project_id] || d.project_id;
              return (
                <div key={d.id} className="dl-card">
                  <div className="dl-card-head">
                    <span className="dl-card-project">{pName}</span>
                    <span
                      className="dl-card-status"
                      style={{ background: s.bg, color: s.color }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="dl-card-meta">
                    <div className="dl-card-field">
                      <span className="dl-card-label">الإصدار</span>
                      <span className="dl-card-value" style={{ fontFamily: 'monospace', color: 'var(--bronze)' }}>
                        {d.changelog?.version || '-'}
                      </span>
                    </div>
                    <div className="dl-card-field">
                      <span className="dl-card-label">النوع</span>
                      <span className="dl-card-value">{d.type}</span>
                    </div>
                    <div className="dl-card-field">
                      <span className="dl-card-label">الحجم</span>
                      <span className="dl-card-value">
                        {'size' in d ? (d as Record<string, unknown>).size as string : '-'}
                      </span>
                    </div>
                  </div>
                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="a-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    تحميل
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase 3.1: عنصر مراقبة لتحميل الصفحة التالية تلقائياً */}
        {!hasActiveFilter && hasMore && (
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(var(--text-rgb), 0.4)', fontSize: '0.85rem' }}>
            {loadingMore ? 'جارٍ تحميل المزيد...' : ''}
          </div>
        )}

        {/* Notice */}
        <div style={{
          marginTop: 20,
          padding: '14px 18px',
          borderRadius: 10,
          background: 'rgba(var(--bronze-rgb), 0.05)',
          border: '1px solid rgba(var(--bronze-rgb), 0.12)',
          fontSize: '0.78rem',
          color: 'rgba(var(--text-rgb), 0.4)',
          lineHeight: 1.7,
        }}>
          جميع التعريبات غير رسمية ولأغراض شخصية فقط. يرجى شراء النسخ الأصلية لدعم المطورين.
        </div>
      </div>

      <style>{`
        .dl-row:hover td { background: rgba(var(--bronze-rgb), 0.03); }

        /* الافتراضي (شاشات كبيرة): الجدول ظاهر، البطاقات مخفية */
        .downloads-card-list { display: none; }

        @media (max-width: 768px) {
          .dl-stats-grid { grid-template-columns: 1fr !important; }
        }

        /* تحت 640px: نخفي الجدول الخام (مهما كان عرضه) ونعرض بطاقات بدلاً
           منه — أوضح من تصغير الخط أو السماح بـ overflow أفقي صامت. */
        @media (max-width: 640px) {
          .downloads-table-wrapper { display: none; }
          .downloads-table-shell { border: none; border-radius: 0; }
          .downloads-card-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .dl-card {
            border: 1px solid rgba(var(--bronze-rgb), 0.12);
            border-radius: 14px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: rgba(var(--bronze-rgb), 0.02);
          }
          .dl-card-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .dl-card-project {
            font-weight: 700;
            color: var(--text);
            font-size: 0.95rem;
          }
          .dl-card-status {
            padding: 3px 10px;
            border-radius: 999px;
            font-size: 0.68rem;
            font-weight: 700;
          }
          .dl-card-meta {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
          .dl-card-field {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .dl-card-label {
            font-size: 0.66rem;
            color: rgba(var(--text-rgb), 0.4);
          }
          .dl-card-value {
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text);
          }
        }
      `}</style>
    </div>
  );
}
