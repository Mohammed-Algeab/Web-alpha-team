import { useEffect, useRef, useState } from 'react';
import PostCard from '@/components/PostCard';
import type { Post, Tags, Project, PostCategory } from '@/types';

interface BlogPageProps {
  posts: Post[];
  tags: Tags;
  projects: Project[];
  postCategories: PostCategory[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function BlogPage({ posts, tags, projects, postCategories, hasMore, loadingMore, onLoadMore }: BlogPageProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const allTags = Object.keys(tags);
  const hasActiveFilter = Boolean(activeTag || activeProject || activeCategory);

  const filteredPosts = posts.filter((p) => {
    if (activeTag && !p.tags.includes(activeTag)) return false;
    if (activeProject && p.project_id !== activeProject) return false;
    if (activeCategory && p.category_id !== activeCategory) return false;
    return true;
  });

  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Phase 3.1: تحميل تدريجي عند اقتراب نهاية القائمة — فقط حين لا يوجد فلتر نشط،
  // لأن "تحميل المزيد" غير المفلتر لا معنى له أثناء عرض نتائج مفلترة من صفحة واحدة فقط.
  useEffect(() => {
    if (hasActiveFilter || !onLoadMore || !hasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) onLoadMore();
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasActiveFilter, onLoadMore, hasMore, loadingMore]);

  return (
    <div className="min-h-screen" style={{ paddingTop: 62 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-badge" style={{ marginBottom: 20 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bronze)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
          <span>{posts.length} منشور</span>
        </div>
        <div className="a-section-label">— المدونة</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span style={{ color: 'var(--text)' }}>آخر </span>
          <span className="gold-text">الأخبار والتحديثات</span>
        </h1>
        <p style={{ fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', color: 'rgba(var(--text-rgb), 0.5)', lineHeight: 1.8, maxWidth: 560 }}>
          تابع آخر أخبار مشاريع التعريب والإصدارات الجديدة
        </p>
      </div>

      {/* Category Filter */}
      {postCategories.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>التصنيف:</span>
            <button
              onClick={() => setActiveCategory(null)}
              className={`a-tag${activeCategory === null ? ' active' : ''}`}
            >
              الكل
            </button>
            {postCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`a-tag${activeCategory === cat.id ? ' active' : ''}`}
                style={activeCategory === cat.id ? { borderColor: cat.color, color: cat.color } : undefined}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Project Filter */}
      {projects.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>المشروع:</span>
            <button
              onClick={() => setActiveProject(null)}
              className={`a-tag${activeProject === null ? ' active' : ''}`}
            >
              الكل
            </button>
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProject(activeProject === p.id ? null : p.id)}
                className={`a-tag${activeProject === p.id ? ' active' : ''}`}
              >
                {p.title || p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.4)', marginLeft: 4 }}>التصنيفات:</span>
            <button
              onClick={() => setActiveTag(null)}
              className={`a-tag${activeTag === null ? ' active' : ''}`}
            >
              الكل
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`a-tag${activeTag === tag ? ' active' : ''}`}
                title={tags[tag]}
              >
                {tag}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.3)', marginTop: 12 }}>
            {sortedPosts.length} منشور
          </p>
        </div>
      )}

      {/* Posts Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        <div className="blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {sortedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {sortedPosts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد منشورات مطابقة للوسم المحدد.
          </div>
        )}

        {/* Phase 3.1: عنصر مراقبة لتحميل الصفحة التالية تلقائياً */}
        {!hasActiveFilter && hasMore && (
          <div ref={sentinelRef} style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(var(--text-rgb), 0.4)', fontSize: '0.85rem' }}>
            {loadingMore ? 'جارٍ تحميل المزيد...' : ''}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .blog-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .blog-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
