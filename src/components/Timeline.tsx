import type { TimelineItem } from '@/types';

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="relative pr-6">
      <div
        className="absolute right-2 top-0 bottom-0 w-0.5"
        style={{ backgroundColor: 'var(--bronze)', opacity: 0.4 }}
      />
      <div className="space-y-6">
        {sorted.map((item, index) => (
          <div key={index} className="relative fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
            <div
              className="absolute -right-6 top-1.5 w-3 h-3 rounded-full border-2"
              style={{
                borderColor: 'var(--bronze)',
                backgroundColor: 'var(--bg)',
              }}
            />
            <div className="mr-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded"
                  style={{
                    color: 'var(--bg)',
                    backgroundColor: 'var(--bronze)',
                    fontFamily: 'Cairo',
                  }}
                >
                  v{item.version}
                </span>
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {new Date(item.date).toLocaleDateString('en-US')}
                </span>
              </div>
              <p
                className="mt-1 text-sm leading-relaxed"
                style={{ color: 'var(--text)' }}
              >
                {item.notes}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
