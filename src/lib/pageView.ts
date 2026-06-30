// src/lib/pageView.ts — Phase 5.3: تسجيل مشاهدة محتوى (مرة واحدة باليوم لكل متصفح)
import { supabase, supabaseConfigured } from '@/lib/supabase';

const VISITOR_HASH_KEY = 'visitor_hash';

function getVisitorHash(): string {
  let hash = localStorage.getItem(VISITOR_HASH_KEY);
  if (!hash) {
    hash = crypto.randomUUID();
    localStorage.setItem(VISITOR_HASH_KEY, hash);
  }
  return hash;
}

export async function recordPageView(contentType: 'project' | 'post' | 'download', contentId: string) {
  if (!supabaseConfigured) return;
  try {
    await supabase.from('page_views').insert({
      content_type: contentType,
      content_id: contentId,
      visitor_hash: getVisitorHash(),
      viewed_at: new Date().toISOString().split('T')[0],
    });
  } catch {
    // §5.3: تطابق UNIQUE constraint (نفس الجهاز/المحتوى/اليوم) يُتجاهل بصمت — هذا متوقع
  }
}
