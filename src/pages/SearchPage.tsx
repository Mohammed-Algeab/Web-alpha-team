import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';
import type { Project, Post, Independent } from '@/types';

interface SearchPageProps {
  projects: Project[];
  posts: Post[];
  independent: Independent[];
}

export default function SearchPage({ projects, posts, independent }: SearchPageProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialTag = searchParams.get('tag') || '';

  const [query, setQuery] = useState(initialQuery || initialTag);

  useEffect(() => {
    if (initialTag) {
      setQuery(initialTag);
    }
  }, [initialTag]);

  const results = useMemo(() => {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return { projects: [], posts: [], independent: [] };

    const matchedProjects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.type.includes(searchTerm)
    );

    const matchedPosts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.content.toLowerCase().includes(searchTerm) ||
        p.tags.some((t) => t.includes(searchTerm))
    );

    const matchedIndependent = independent.filter(
      (i) =>
        i.name.toLowerCase().includes(searchTerm) ||
        i.description.toLowerCase().includes(searchTerm)
    );

    return {
      projects: matchedProjects,
      posts: matchedPosts,
      independent: matchedIndependent,
    };
  }, [query, projects, posts, independent]);

  const totalResults = results.projects.length + results.posts.length + results.independent.length;

  return (
    <div className="min-h-screen" style={{ paddingTop: 62 }}>
      {/* Hero */}
      <div className="a-page-hero" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="a-section-label">— البحث</div>
        <h1 className="a-section-h" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 14 }}>
          <span className="gold-text">ابحث </span>
          <span style={{ color: 'var(--text)' }}>في كل شيء</span>
        </h1>
      </div>

      {/* Search Input */}
      <div style={{ maxWidth: 720, margin: '0 auto 28px', padding: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) {
                setSearchParams({ q: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            placeholder="ابحث في المشاريع والمنشورات والتعريبات..."
            className="a-input"
            style={{ padding: '14px 48px 14px 16px', fontSize: '1rem' }}
            autoFocus
          />
          <Search
            size={18}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(var(--bronze-rgb), 0.5)' }}
          />
        </div>
      </div>

      {/* Results count */}
      {query && (
        <p style={{ fontSize: '0.82rem', marginBottom: 24, textAlign: 'center', color: 'rgba(var(--text-rgb), 0.45)' }}>
          {totalResults} نتيجة لـ "{query}"
        </p>
      )}

      {/* Results */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        {totalResults > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {/* Projects */}
            {results.projects.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="a-section-label" style={{ margin: 0 }}>— المشاريع</div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.3)', marginRight: 'auto' }}>{results.projects.length}</span>
                </div>
                <div className="search-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                  {results.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            )}

            {/* Posts */}
            {results.posts.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="a-section-label" style={{ margin: 0 }}>— المنشورات</div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.3)', marginRight: 'auto' }}>{results.posts.length}</span>
                </div>
                <div className="search-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                  {results.posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Independent */}
            {results.independent.length > 0 && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div className="a-section-label" style={{ margin: 0 }}>— تعريبات مستقلة</div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(var(--text-rgb), 0.3)', marginRight: 'auto' }}>{results.independent.length}</span>
                </div>
                <div className="search-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                  {results.independent.map((item) => (
                    <a
                      key={item.id}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="a-card"
                      style={{ padding: '18px 20px', textDecoration: 'none', display: 'block' }}
                    >
                      <span className="a-tag" style={{ cursor: 'default', marginBottom: 10, display: 'inline-block' }}>{item.type}</span>
                      <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)', marginBottom: 6, fontFamily: 'Cairo, sans-serif' }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.78rem', color: 'rgba(var(--text-rgb), 0.45)' }}>
                        {item.description}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : query ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', color: 'rgba(var(--text-rgb), 0.4)' }}>
            لا توجد نتائج مطابقة لـ "{query}".
          </div>
        ) : null}

        {/* Quick links when empty */}
        {!query && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ marginBottom: 20, color: 'rgba(var(--text-rgb), 0.45)' }}>
              ابدأ بالكتابة للبحث، أو تصفح:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
              <Link to="/projects" className="a-btn-outline" style={{ textDecoration: 'none' }}>
                <span>المشاريع</span>
                <ArrowLeft size={14} />
              </Link>
              <Link to="/blog" className="a-btn-outline" style={{ textDecoration: 'none' }}>
                <span>المدونة</span>
                <ArrowLeft size={14} />
              </Link>
              <Link to="/independent" className="a-btn-outline" style={{ textDecoration: 'none' }}>
                <span>تعريبات مستقلة</span>
                <ArrowLeft size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .search-grid { grid-template-columns: 1fr !important; gap: 14px !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .search-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
