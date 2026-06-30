// src/pages/VersionsPage.tsx
// ponytail: صفحة جديدة — لم تكن موجودة بـweb أصلاً (اكتُشف غيابها أثناء
// تطبيق نهج "3 إصدارات + رابط عرض الكل" المتفق عليه). تطابق بنية VersionsPage
// في الـPWA (pwa/src/pages/VersionsPage.tsx) من ناحية المنطق، بأسلوب inline
// styles المتّبع في باقي صفحات web.
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Search, Clock, Download as DownloadIcon } from 'lucide-react';
import { useProjectDownloads } from '@/hooks/useProjectDownloads';
import type { Project, ChangelogItem } from '@/types';

interface VersionsPageProps {
  projects: Project[];
  changelogs: ChangelogItem[];
}

const TYPE_LABEL: Record<string, string> = { patch: 'تصحيح', full: 'كامل', dlc: 'إضافة' };

function formatDate(str: string) {
  try {
    return new Date(str).toLocaleDateString('en-US');
  } catch {
    return str;
  }
}

export default function VersionsPage({ projects, changelogs }: VersionsPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { downloads } = useProjectDownloads(id);

  const project = projects.find((p) => p.id === id);

  const projectChangelogs = useMemo(
    () =>
      changelogs
        .filter((c) => c.project_id === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [changelogs, id]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projectChangelogs;
    return projectChangelogs.filter((c) => c.version.toLowerCase().includes(q));
  }, [projectChangelogs, query]);

  const downloadsFor = (changelogId: string) => downloads.filter((d) => d.changelog_id === changelogId);

  return (
    <div className="min-h-screen" style={{ paddingTop: 80, maxWidth: 720, margin: '0 auto', padding: '80px 20px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          aria-label="رجوع"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(var(--text-rgb), 0.5)' }}
        >
          <ArrowRight size={22} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>الإصدارات السابقة</p>
          {project && (
            <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.45)', marginTop: 2 }}>
              {project.title || project.name}
            </p>
          )}
        </div>
        <span style={{ width: 22 }} />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 14px',
          borderRadius: 12,
          border: '1px solid rgba(var(--bronze-rgb), 0.2)',
          background: 'rgba(var(--bronze-rgb), 0.04)',
          marginBottom: 20,
        }}
      >
        <Search size={16} style={{ color: 'rgba(var(--text-rgb), 0.4)' }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="بحث برقم الإصدار..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            color: 'var(--text)',
            textAlign: 'right',
          }}
          dir="rtl"
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(var(--text-rgb), 0.4)' }}>
          <Clock size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <p>{query ? `لا توجد نتائج لـ "${query}"` : 'لا توجد إصدارات سابقة'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((log, index) => {
            const isLatest = index === 0 && !query;
            const dls = downloadsFor(log.id);
            return (
              <div
                key={log.id}
                className="bronze-border"
                style={{ padding: 18, borderRadius: 14, background: 'rgba(var(--bronze-rgb), 0.04)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background: 'var(--bronze)',
                        color: 'var(--bg)',
                        fontFamily: 'Cairo, sans-serif',
                      }}
                    >
                      v{log.version}
                    </span>
                    {isLatest && (
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--success)' }}>آخر إصدار</span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.45)' }}>{formatDate(log.date)}</span>
                </div>

                {(log.changes || []).length > 0 && (
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: dls.length > 0 ? 12 : 0 }}>
                    {log.changes.map((ch, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.85rem', color: 'var(--text)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', marginTop: 7, flexShrink: 0 }} />
                        {ch}
                      </li>
                    ))}
                  </ul>
                )}

                {dls.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(var(--bronze-rgb), 0.1)' }}>
                    {dls.map((d) => (
                      <a
                        key={d.id}
                        href={d.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: 10,
                          borderRadius: 10,
                          background: 'rgba(var(--bronze-rgb), 0.06)',
                          textDecoration: 'none',
                        }}
                      >
                        <DownloadIcon size={14} style={{ color: 'var(--bronze)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{d.title}</span>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(var(--text-rgb), 0.45)' }}>
                          {TYPE_LABEL[d.type] || d.type} · {d.status === 'beta' ? 'تجريبي' : 'مستقر'}
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {project && (
        <Link
          to={`/projects/${project.id}`}
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 24,
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--bronze)',
            textDecoration: 'none',
          }}
        >
          العودة لصفحة المشروع
        </Link>
      )}
    </div>
  );
}
