import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { ArrowRight, Calendar, Tag, ArrowLeft } from 'lucide-react';
import PostCard from '@/components/PostCard';
import CopyLinkButton from '@/components/CopyLinkButton';
import OGMetaTags from '@/components/OGMetaTags';
import { GiscusComments, getGiscusTerm } from '@/components/GiscusComments';
import { recordPageView } from '@/lib/pageView';
import { getAppliedTheme } from '@/hooks/useTheme';
import type { Post } from '@/types';

interface PostDetailPageProps {
  posts: Post[];
}

export default function PostDetailPage({ posts }: PostDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const post = posts.find((p) => p.id === id);

  useEffect(() => {
    if (!post && posts.length > 0) {
      navigate('/blog');
    }
  }, [post, posts, navigate]);

  useEffect(() => {
    if (post?.id) recordPageView('post', post.id);
  }, [post?.id]);

  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return posts
      .filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [post, posts]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
        جاري التحميل...
      </div>
    );
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl font-bold mt-6 mb-3" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={i} className="mr-4 mb-1" style={{ color: 'var(--text)' }}>
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim() === '') {
        return <div key={i} className="h-2" />;
      }
      return <p key={i} className="mb-3 leading-relaxed" style={{ color: 'var(--text)' }}>{line}</p>;
    });
  };

  return (
    <>
      <OGMetaTags
        title={post.title}
        description={post.excerpt}
        image={undefined}
        url={`${import.meta.env.VITE_SITE_URL}/blog/${post.id}`}
        type="article"
      />

      <div className="min-h-screen pt-24 pb-16">
        <div className="container-limit mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            {/* Back */}
            <Link
              to="/blog"
              className="inline-flex items-center gap-1 text-sm mb-6 transition-colors hover:text-[var(--bronze)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ArrowRight size={16} />
              <span>العودة للمدونة</span>
            </Link>

            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Calendar size={16} style={{ color: 'var(--text-secondary)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(post.date).toLocaleDateString('en-US')}
                  </span>
                </div>
                <CopyLinkButton shareUrl={`${import.meta.env.VITE_SITE_URL}/blog/${post.id}`} />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ fontFamily: 'Cairo' }}
              >
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Tag size={14} style={{ color: 'var(--bronze)' }} />
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?tag=${encodeURIComponent(tag)}`}
                    className="text-sm px-2 py-0.5 rounded transition-colors hover:opacity-80"
                    style={{
                      color: 'var(--bronze)',
                      border: '1px solid var(--bronze)',
                      fontFamily: 'Cairo',
                    }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </header>

            {/* Content */}
            <article
              className="bronze-border p-6 sm:p-8 mb-8"
              style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.04)' }}
            >
              <div className="prose prose-invert max-w-none">
                {renderContent(post.content)}
              </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <h2
                  className="text-xl font-bold mb-6 flex items-center gap-2"
                  style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}
                >
                  <ArrowLeft size={20} />
                  <span>منشورات ذات صلة</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {relatedPosts.map((rp) => (
                    <PostCard key={rp.id} post={rp} />
                  ))}
                </div>
              </section>
            )}

            {/* Giscus Comments */}
            <section style={{ marginTop: 40 }}>
              <GiscusComments
                term={getGiscusTerm('post', post.id)}
                theme={getAppliedTheme() === 'light' ? 'alpha-light' : 'alpha-dark'}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
