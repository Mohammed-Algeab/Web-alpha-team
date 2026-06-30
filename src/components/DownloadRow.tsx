import { ExternalLink } from 'lucide-react';
import type { Download } from '@/types';

interface DownloadRowProps {
  download: Download;
  projectName?: string;
}

const statusColors: Record<string, string> = {
  'جديد': 'var(--success)',
  'محدّث': 'var(--bronze)',
  'قديم': 'var(--text-secondary)',
};

export default function DownloadRow({ download, projectName }: DownloadRowProps) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bronze-border-thin"
      style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.04)' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4
            className="font-bold text-base"
            style={{ fontFamily: 'Cairo' }}
          >
            {download.title}
          </h4>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{
              backgroundColor: statusColors[download.status] || 'var(--bronze)',
              color: '#fff',
              fontFamily: 'Cairo',
            }}
          >
            {download.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {projectName && <span>{projectName}</span>}
          <span>v{download.changelog?.version || '?'}</span>
          <span>{download.type}</span>
          {download.changelog?.date && <span>{new Date(download.changelog.date).toLocaleDateString('en-US')}</span>}
        </div>
      </div>
      <a
        href={download.link}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-bronze text-sm"
      >
        <span>تحميل</span>
        <ExternalLink size={14} />
      </a>
    </div>
  );
}
