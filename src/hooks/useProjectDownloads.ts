// src/hooks/useProjectDownloads.ts
// ponytail: مشكلة حقيقية اكتُشفت — data.downloads العام (من useData.ts)
// محدود بـPAGE_SIZE (20) بالكل، وليس لكل مشروع. صفحة المشروع/الإصدارات
// تحتاج كل تحميلات مشروع واحد بالذات، بغض النظر عن كم تحميل موجود بمشاريع
// أخرى. الحل: جلب مستقل ومخصص هنا (lazy، فقط عند فتح صفحة المشروع)، بدون
// أي حد (range) — فلا يفوت أي إصدار قديم بغض النظر عن نمو الموقع مستقبلاً.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Download } from '@/types';

export function useProjectDownloads(projectId: string | undefined) {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setDownloads([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    supabase
      .from('downloads')
      .select('*, changelog:changelogs(version,date)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (!error) setDownloads(data || []);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  return { downloads, loading };
}
