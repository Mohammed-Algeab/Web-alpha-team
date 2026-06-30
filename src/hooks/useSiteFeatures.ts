// src/hooks/useSiteFeatures.ts
// ponytail: SiteFeatures → Record<string,boolean>
//           أُزيل `if (row.key in result)` — كان يمنع أي feature جديدة من الDB من العمل
//           أُزيلت defaultFeatures الـ hardcoded — الـ default هو {} (كل شيء disabled افتراضياً)
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type SiteFeatures = Record<string, boolean>;

export function useSiteFeatures(): SiteFeatures {
  const [features, setFeatures] = useState<SiteFeatures>({});
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (!supabaseUrl) return;

    async function fetchFeatures() {
      const { data, error } = await supabase.from('site_features').select('key, enabled');
      if (error) { console.warn('[useSiteFeatures]', error.message); return; }
      setFeatures(Object.fromEntries((data || []).map(r => [r.key, r.enabled])));
    }

    fetchFeatures();

    const channel = supabase
      .channel('site_features_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_features' }, fetchFeatures)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabaseUrl]);

  return features;
}
