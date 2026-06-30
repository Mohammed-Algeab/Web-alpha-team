import { Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Theme = 'dark' | 'light' | 'system';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: 'dark', icon: <Moon size={14} />, label: 'داكن' },
    { value: 'light', icon: <Sun size={14} />, label: 'فاتح' },
    { value: 'system', icon: <Monitor size={14} />, label: 'تلقائي' },
  ];

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        padding: 3,
        borderRadius: 8,
        background: 'var(--card-surface)',
        border: '1px solid var(--border)',
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          title={opt.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            padding: '4px 8px',
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Cairo, system-ui, sans-serif',
            fontSize: '0.72rem',
            fontWeight: theme === opt.value ? 700 : 400,
            background: theme === opt.value ? 'var(--bronze)' : 'transparent',
            color: theme === opt.value ? 'var(--bg)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease',
          }}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
