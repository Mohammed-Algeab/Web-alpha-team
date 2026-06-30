import { Link } from 'react-router-dom';
import { Clock, Tag, Download as DownloadIcon, ChevronLeft } from 'lucide-react';
import type { ChangelogItem, Download } from '@/types';

interface ChangelogSectionProps {
  changelogs: ChangelogItem[];
  downloads: Download[];
  projectId: string;
}

const TYPE_LABEL: Record<string, string> = { patch: 'تصحيح', full: 'كامل', dlc: 'إضافة' };

// ponytail: نعرض فقط آخر 3 إصدارات مباشرة بصفحة المشروع (قرار المستخدم) —
// باقي التاريخ بصفحة /versions/:id منفصلة، حتى لا تطول صفحة المشروع بلا حد
// لو تراكمت إصدارات كثيرة مستقبلاً. يطابق نهج LatestVersionCard/VersionsPage
// في الـPWA الذي ثبّتنا أنه الأفضل (جلسة سابقة).
const VISIBLE_COUNT = 3;

export default function ChangelogSection({ changelogs, downloads, projectId }: ChangelogSectionProps) {
  const projectChangelogs = changelogs
    .filter((c) => c.project_id === projectId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (projectChangelogs.length === 0) return null;

  const visibleChangelogs = projectChangelogs.slice(0, VISIBLE_COUNT);
  const hasMore = projectChangelogs.length > VISIBLE_COUNT;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Clock size={20} style={{ color: 'var(--bronze)' }} />
          <h2
            className="text-xl font-bold"
            style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}
          >
            سجل الإصدارات
          </h2>
        </div>
        {hasMore && (
          <Link
            to={`/versions/${projectId}`}
            className="flex items-center gap-1 text-sm font-bold no-underline"
            style={{ color: 'var(--bronze)' }}
          >
            عرض كل الإصدارات
            <ChevronLeft size={14} />
          </Link>
        )}
      </div>

      <div className="space-y-4">
        {visibleChangelogs.map((log, index) => {
          const logDownloads = downloads.filter((d) => d.changelog_id === log.id);
          const isLatest = index === 0;

          return (
            <div
              key={log.id}
              className="bronze-border p-5"
              style={{
                backgroundColor: 'rgba(var(--bronze-rgb), 0.04)',
                borderColor: isLatest ? 'var(--bronze)' : undefined,
              }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: 'var(--bronze)',
                    color: 'var(--bg)',
                    fontFamily: 'Cairo',
                  }}
                >
                  <Tag size={12} className="inline ml-1" />
                  v{log.version}
                </span>
                {isLatest && (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(80,200,120,0.15)', color: 'var(--success)' }}
                  >
                    آخر إصدار
                  </span>
                )}
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(log.date).toLocaleDateString('en-US')}
                </span>
              </div>

              <ul className="space-y-1">
                {(log.changes || []).map((change, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm"
                    style={{ color: 'var(--text)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: 'var(--bronze)' }}
                    />
                    {change}
                  </li>
                ))}
              </ul>

              {logDownloads.length > 0 && (
                <div
                  className="mt-3 pt-3 space-y-2"
                  style={{ borderTop: '1px solid rgba(var(--bronze-rgb), 0.1)' }}
                >
                  {logDownloads.map((d) => (
                    <a
                      key={d.id}
                      href={d.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2.5 p-2.5 rounded-lg text-sm no-underline"
                      style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.06)' }}
                    >
                      <DownloadIcon size={14} style={{ color: 'var(--bronze)', flexShrink: 0 }} />
                      <span style={{ color: 'var(--text)', fontWeight: 600, flex: 1 }}>{d.title}</span>
                      <span style={{ color: 'rgba(var(--text-rgb), 0.45)', fontSize: '0.75rem' }}>
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

      {hasMore && (
        <Link
          to={`/versions/${projectId}`}
          className="flex items-center justify-center gap-1.5 mt-4 py-3 rounded-xl text-sm font-bold no-underline"
          style={{ border: '1px solid rgba(var(--bronze-rgb), 0.25)', color: 'var(--bronze)' }}
        >
          عرض كل الإصدارات السابقة ({projectChangelogs.length - VISIBLE_COUNT}+)
          <ChevronLeft size={14} />
        </Link>
      )}
    </section>
  );
}
