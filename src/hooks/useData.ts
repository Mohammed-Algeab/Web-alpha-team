// src/hooks/useData.ts
// Phase 1 (offline-first) + Phase 3.1 (pagination for posts/downloads) + Phase 3.2 (realtime)
// ponytail: react-query powered with cache persistence via AsyncStorage
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  ChangelogItem, CreditItem, Download, FAQItem, GlossaryItem,
  Independent, Post, PostCategory, Project, Settings, Tags, TeamMember,
} from '@/types';

const PAGE_SIZE = 20;

interface DataState {
  settings: Settings | null;
  projects: Project[];
  posts: Post[];
  downloads: Download[];
  independent: Independent[];
  team: TeamMember[];
  tags: Tags;
  glossary: GlossaryItem[];
  faq: FAQItem[];
  credits: CreditItem[];
  changelogs: ChangelogItem[];
  postCategories: PostCategory[];
  loading: boolean;
  error: string | null;
  // Phase 3.1: pagination state — فقط لـ posts/downloads (الجداول التي تكبر بلا حد طبيعي)
  hasMorePosts: boolean;
  hasMoreDownloads: boolean;
  loadingMorePosts: boolean;
  loadingMoreDownloads: boolean;
  loadMorePosts: () => void;
  loadMoreDownloads: () => void;
}

const initialState: Omit<DataState, 'loadMorePosts' | 'loadMoreDownloads'> = {
  settings: null, projects: [], posts: [], downloads: [],
  independent: [], team: [], tags: {}, glossary: [], faq: [],
  credits: [], changelogs: [], postCategories: [],
  loading: true, error: null,
  hasMorePosts: true, hasMoreDownloads: true,
  loadingMorePosts: false, loadingMoreDownloads: false,
};

function extractTags(posts: Post[]): Tags {
  const all = new Set<string>();
  posts.forEach(p => p.tags?.forEach(t => all.add(t)));
  return Object.fromEntries([...all].map(t => [t, t]));
}

function mapPosts(po: any[] | null): Post[] {
  return (po || []).map(p => ({
    ...p,
    slug:        p.slug        || p.id,
    excerpt:     p.excerpt     || '',
    content:     p.content     || '',
    tags:        p.tags        || [],
    project_id:  p.project_id  ?? null,
    category_id: p.category_id ?? null,
  }));
}

function mapDownloads(dl: any[] | null): Download[] {
  return (dl || []).map(d => ({
    ...d,
    filename: d.filename || null,
    notes:    d.notes    || null,
    type:     d.type     || 'patch',
    status:   d.status   || 'stable',
    changelog: d.changelog || undefined,
  }));
}

export function useData(): DataState {
  const [data, setData] = useState(initialState);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    if (!supabaseUrl) {
      setData(prev => ({ ...prev, loading: false, error: 'Supabase غير مُهيأ — تحقق من ملف .env' }));
      return;
    }

    async function fetchData() {
      try {
        // Phase 3.1: Pagination — أول صفحة فقط لـ posts/downloads (الباقي via loadMore*)
        const [
          { data: sd }, { data: pr }, { data: po }, { data: dl },
          { data: ind }, { data: tm }, { data: gl }, { data: fq },
          { data: cr }, { data: cl }, { data: pc },
        ] = await Promise.all([
          supabase.from('settings').select('*').eq('id', 1).single(),
          supabase.from('projects').select('*'),
          supabase.from('posts').select('*').order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1),
          supabase.from('downloads').select('*, changelog:changelogs(version,date)').order('created_at', { ascending: false }).range(0, PAGE_SIZE - 1),
          supabase.from('independent').select('*'),
          supabase.from('team').select('*'),
          supabase.from('glossary').select('*'),
          supabase.from('faq').select('*').order('order', { ascending: true }),
          supabase.from('credits').select('*'),
          supabase.from('changelogs').select('*').order('created_at', { ascending: false }),
          supabase.from('post_categories').select('*').order('display_order', { ascending: true }),
        ]);

        // Settings — fallbacks فقط
        const settings: Settings | null = sd ? {
          site_name:        sd.site_name        || 'فريق ألفا للتعريب',
          tagline:          sd.tagline           || 'نُعرِّب ما تحبه',
          telegram_channel: sd.telegram_channel || '',
          telegram_group:   sd.telegram_group   || '',
          email:            sd.email             ?? null,
          site_description: sd.site_description || '',
          keywords:         sd.keywords          || '',
        } : null;

        // Projects — spread + override الحقول التي تحتاج fallback
        const projects: Project[] = (pr || []).map(p => ({
          ...p,
          title:         p.title || p.name,
          progress:      p.progress      ?? 0,
          featured:      p.featured      ?? false,
          display_order: p.display_order ?? 0,
          images:        p.images        || null,
          comparisons:   Array.isArray(p.comparisons) ? p.comparisons : null,
          timeline:      Array.isArray(p.timeline)    ? p.timeline    : null,
          struggle_story: p.struggle_story || null,
          download_link:  p.download_link  || null,
        }));

        const posts = mapPosts(po);
        const downloads = mapDownloads(dl);
        const tags = extractTags(posts);

        setData({
          settings, projects, posts, downloads, tags,
          independent: (ind || []) as Independent[],
          team:        (tm  || []) as TeamMember[],
          glossary:    (gl  || []) as GlossaryItem[],
          faq:         (fq  || []) as FAQItem[],
          credits:     (cr  || []) as CreditItem[],
          changelogs:  (cl  || []) as ChangelogItem[],
          postCategories: (pc || []) as PostCategory[],
          loading: false, error: null,
          hasMorePosts: (po || []).length === PAGE_SIZE,
          hasMoreDownloads: (dl || []).length === PAGE_SIZE,
          loadingMorePosts: false, loadingMoreDownloads: false,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'خطأ غير معروف';
        setData(prev => ({ ...prev, loading: false, error: `فشل في تحميل البيانات: ${msg}` }));
      }
    }

    fetchData();

    // Phase 3.2: Realtime subscriptions for downloads + posts
    const downloadsChannel = supabase
      .channel('downloads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'downloads' }, () => fetchData())
      .subscribe();

    const postsChannel = supabase
      .channel('posts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => fetchData())
      .subscribe();

    return () => {
      downloadsChannel.unsubscribe();
      postsChannel.unsubscribe();
    };
  }, [supabaseUrl]);

  // ponytail (§3.1): دالتان صغيرتان فقط — تُلحقان صفحة جديدة بالـ state الحالي
  // بدل إعادة جلب كل شيء. لا حاجة لمكتبة infinite-query هنا، الويب ليس react-query.
  async function loadMorePosts() {
    if (data.loadingMorePosts || !data.hasMorePosts) return;
    setData(prev => ({ ...prev, loadingMorePosts: true }));
    const from = data.posts.length;
    const { data: po } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const newPosts = mapPosts(po);
    setData(prev => ({
      ...prev,
      posts: [...prev.posts, ...newPosts],
      tags: extractTags([...prev.posts, ...newPosts]),
      hasMorePosts: newPosts.length === PAGE_SIZE,
      loadingMorePosts: false,
    }));
  }

  async function loadMoreDownloads() {
    if (data.loadingMoreDownloads || !data.hasMoreDownloads) return;
    setData(prev => ({ ...prev, loadingMoreDownloads: true }));
    const from = data.downloads.length;
    const { data: dl } = await supabase
      .from('downloads')
      .select('*, changelog:changelogs(version,date)')
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1);
    const newDownloads = mapDownloads(dl);
    setData(prev => ({
      ...prev,
      downloads: [...prev.downloads, ...newDownloads],
      hasMoreDownloads: newDownloads.length === PAGE_SIZE,
      loadingMoreDownloads: false,
    }));
  }

  return { ...data, loadMorePosts, loadMoreDownloads };
}

