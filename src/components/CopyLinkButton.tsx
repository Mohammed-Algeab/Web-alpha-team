import { Link2, Check } from 'lucide-react';
import { useCopyLink } from '@/hooks/useCopyLink';

interface CopyLinkButtonProps {
  className?: string;
  /** رابط /share/ النظيف (بدون #/) — إن لم يُمرَّر، يُنسخ window.location.href كما كان سابقاً. */
  shareUrl?: string;
}

export default function CopyLinkButton({ className = '', shareUrl }: CopyLinkButtonProps) {
  const { copied, copy } = useCopyLink(shareUrl);

  return (
    <button
      onClick={copy}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200 ${className}`}
      style={{
        backgroundColor: copied ? 'var(--success)' : 'rgba(var(--bronze-rgb), 0.1)',
        color: copied ? '#fff' : 'var(--bronze)',
        border: '1px solid var(--bronze)',
        fontFamily: 'Cairo',
      }}
      title={copied ? 'تم النسخ!' : 'نسخ الرابط'}
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />}
      <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
    </button>
  );
}
