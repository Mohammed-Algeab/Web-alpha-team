import { useState, useCallback } from 'react';

export function useCopyLink(explicitUrl?: string): { copied: boolean; copy: () => void } {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    const urlToCopy = explicitUrl || window.location.href;
    navigator.clipboard.writeText(urlToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [explicitUrl]);

  return { copied, copy };
}
