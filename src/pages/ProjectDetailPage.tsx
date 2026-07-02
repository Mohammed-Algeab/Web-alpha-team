import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import PostCard from '@/components/PostCard';
import CopyLinkButton from '@/components/CopyLinkButton';
import ImageGallery from '@/components/ImageGallery';
import ChangelogSection from '@/components/ChangelogSection';
import ComparisonSection from '@/components/ComparisonSection';
import OGMetaTags from '@/components/OGMetaTags';
import { GiscusComments, getGiscusTerm } from '@/components/GiscusComments';
import { recordPageView } from '@/lib/pageView';
import { getAppliedTheme } from '@/hooks/useTheme';
import { assetUrl } from '@/lib/assetUrl';
import { useProjectDownloads } from '@/hooks/useProjectDownloads';
import type { Project, Post, ChangelogItem } from '@/types';

interface ProjectDetailPageProps {
  projects: Project[];
  posts: Post[];
  changelogs: ChangelogItem[];
}

const STATUS_LABELS: Record<string, string> = {
  active: 'جاري العمل',
  completed: 'مكتمل',
  upcoming: 'قادم قريباً',
  paused: 'متوقف',
};

const STATUS_CLASSES: Record<string, string> = {
  active: 'a-status-active',
  completed: 'a-status-completed',
  upcoming: 'a-status-upcoming',
  paused: 'a-status-paused',
};

export default function ProjectDetailPage({ projects, posts, changelogs }: ProjectDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === id);
  const { downloads } = useProjectDownloads(project?.id);

  useEffect(() => {
    if (!project && projects.length > 0) {
      navigate('/projects');
    }
  }, [project, projects, navigate]);

  useEffect(() => {
    if (project?.id) recordPageView('project', project.id);
  }, [project?.id]);

  const relatedPosts = useMemo(() => {
    if (!project) return [];
    return posts.filter((p) => p.project_id === project.id);
  }, [project, posts]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: 'rgba(var(--text-rgb), 0.45)' }}>
        جاري التحميل...
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[project.status] || project.status;
  const statusClass = STATUS_CLASSES[project.status] || 'a-status-active';
  const isCompleted = project.status === 'completed';
  // hasCover: يتحقق من وجود رابط غلاف حقيقي (يختلف عن placeholder).
  // يُستخدم لتجنب تطبيق brightness(0.4) والتدرج الأسود على placeholder
  // الداكنة التي تبدو حينئذٍ كمساحة سوداء فاضية بالكامل.
  const hasCover = !!project.cover && !project.cover.includes('placeholder');

  return (
    <>
      <OGMetaTags
        title={project.name}
        description={project.description}
        image={project.cover}
        url={`${import.meta.env.VITE_SITE_URL}/projects/${project.id}`}
        type="article"
      />

      <div className="min-h-screen" style={{ paddingTop: 62 }}>
        {/* Hero cover — ponytail: brightness(0.4) + التدرج الأسود مصممان
            لجعل النص الأبيض مقروءاً فوق صور أغلفة حقيقية (فاتحة/ملونة).
            لكن صورة placeholder نفسها داكنة بالأصل ومصممة لتكون مقروءة
            بذاتها، فتطبيق نفس التعتيم عليها كان يُغرقها بالسواد فتبدو
            كمساحة فاضية بالكامل (كما رصدنا في السكرين شوت). */}
        <div style={{ position: 'relative', height: 360, overflow: 'hidden' }}>
          <img
            src={project.cover}
            alt={project.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: hasCover ? 'brightness(0.4)' : 'none',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = assetUrl('/images/placeholder.webp');
            }}
          />
          {hasCover && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg) 20%, transparent 70%)' }} />
          )}
          <div style={{ position: 'absolute', bottom: 32, right: 0, left: 0, maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
            {/* Back */}
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: '0.82rem',
                color: 'rgba(var(--text-rgb), 0.5)',
                marginBottom: 16,
                textDecoration: 'none',
              }}
              className="back-link"
            >
              <ArrowRight size={14} />
              <span>العودة للمشاريع</span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`a-status ${statusClass}`}>{statusLabel}</span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '3px 10px',
                    borderRadius: 5,
                    border: '1px solid rgba(var(--bronze-rgb), 0.3)',
                    color: 'rgba(var(--bronze-rgb), 0.75)',
                  }}>
                    {project.type}
                  </span>
                </div>
                <h1 style={{
                  fontFamily: 'Cairo, sans-serif',
                  fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                  color: 'var(--text)',
                  marginBottom: 6,
                }}>
                  {project.title || project.name}
                </h1>
                {(() => {
                  const titleEn = 'title_en' in project ? String((project as Record<string, unknown>).title_en || '') : '';
                  return titleEn ? (
                    <p style={{ fontSize: '0.85rem', color: 'rgba(var(--bronze-rgb), 0.7)' }}>{titleEn}</p>
                  ) : null;
                })()}
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                {project.download_link && (
                  <a
                    href={project.download_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="a-btn-primary"
                    style={{ textDecoration: 'none' }}
                  >
                    <span>تحميل التعريب</span>
                    <ExternalLink size={14} />
                  </a>
                )}
                <CopyLinkButton shareUrl={`${import.meta.env.VITE_SITE_URL}/projects/${project.id}`} />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="project-detail-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
          {/* Main */}
          <div>
            {/* Description */}
            <section style={{ marginBottom: 40 }}>
              <div className="a-section-label">— عن المشروع</div>
              <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 14 }}>
                {project.title || project.name}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.85 }}>
                {project.description}
              </p>
            </section>

            {/* Struggle Story */}
            {project.struggle_story && (
              <section style={{ marginBottom: 40 }}>
                <div className="a-section-label">— قصة الكفاح</div>
                <h2 style={{ fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text)', marginBottom: 14 }}>
                  رحلة التعريب
                </h2>
                <p style={{ fontSize: '0.9rem', color: 'rgba(var(--text-rgb), 0.55)', lineHeight: 1.85 }}>
                  {project.struggle_story}
                </p>
              </section>
            )}

            {/* Comparison */}
            {project.comparisons && project.comparisons.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <ComparisonSection comparisons={project.comparisons} />
              </section>
            )}

            {/* Timeline */}
            {project.timeline && project.timeline.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div className="a-section-label">— سجل الإصدارات</div>
                <div style={{ position: 'relative', paddingRight: 20 }}>
                  <div style={{ position: 'absolute', right: 5, top: 6, bottom: 6, width: 2, background: 'rgba(var(--bronze-rgb), 0.15)', borderRadius: 1 }} />
                  {project.timeline.map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                      <div className="a-timeline-dot done" />
                      <div style={{ paddingBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--success)', fontFamily: 'Cairo, sans-serif' }}>
                          {t.version}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'rgba(80,200,120,0.6)', marginTop: 2 }}>
                          {t.date}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(var(--text-rgb), 0.55)', marginTop: 4 }}>
                          {t.notes}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {project.images && project.images.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <div className="a-section-label">— معرض الصور</div>
                <ImageGallery images={project.images} projectName={project.title || project.name} />
              </section>
            )}

            {/* Changelog */}
            <section style={{ marginBottom: 40 }}>
              <ChangelogSection changelogs={changelogs} downloads={downloads} projectId={project.id} />
            </section>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section>
                <div className="a-section-label">— منشورات مرتبطة</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="related-posts-grid">
                  {relatedPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Giscus Comments */}
            <section style={{ marginTop: 40 }}>
              <GiscusComments
                term={getGiscusTerm('project', project.id)}
                theme={getAppliedTheme() === 'light' ? 'alpha-light' : 'alpha-dark'}
              />
            </section>
          </div>

          {/* Sidebar */}
          <aside>
            {/* Progress */}
            <div style={{
              padding: '20px',
              borderRadius: 14,
              background: 'rgba(var(--bronze-rgb), 0.04)',
              border: '1px solid rgba(var(--bronze-rgb), 0.12)',
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8rem', color: 'rgba(var(--text-rgb), 0.5)', fontFamily: 'Cairo, sans-serif' }}>نسبة الاكتمال</span>
                <span style={{ fontWeight: 900, color: isCompleted ? 'var(--success)' : 'var(--bronze)' }}>{project.progress}%</span>
              </div>
              <div className="a-progress-track" style={{ height: 8 }}>
                <div className={`a-progress-fill${isCompleted ? ' done' : ''}`} style={{ width: `${project.progress}%` }} />
              </div>
            </div>

            {/* Info */}
            <div style={{
              padding: '20px',
              borderRadius: 14,
              background: 'rgba(var(--bronze-rgb), 0.04)',
              border: '1px solid rgba(var(--bronze-rgb), 0.12)',
              marginBottom: 16,
            }}>
              <div className="a-section-label" style={{ marginBottom: 14 }}>معلومات</div>
              {[
                ['النوع', project.type],
                ['الإصدار', project.latest_version || '-'],
                ['الحالة', statusLabel],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: '0.82rem' }}>
                  <span style={{ color: 'rgba(var(--text-rgb), 0.4)' }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Download */}
            {project.download_link && (
              <a
                href={project.download_link}
                target="_blank"
                rel="noopener noreferrer"
                className="a-btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginBottom: 16, textDecoration: 'none' }}
              >
                <span>تحميل آخر إصدار</span>
                <ExternalLink size={14} />
              </a>
            )}

            {/* Project Navigation */}
            <div style={{ padding: '20px', borderRadius: 14, background: 'rgba(var(--bronze-rgb), 0.04)', border: '1px solid rgba(var(--bronze-rgb), 0.12)' }}>
              <div className="a-section-label" style={{ marginBottom: 14 }}>مشاريع أخرى</div>
              {projects.filter(p => p.id !== project.id).slice(0, 4).map((p) => (
                <Link
                  key={p.id}
                  to={`/projects/${p.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 0',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(var(--bronze-rgb), 0.06)',
                    transition: 'all 0.2s',
                  }}
                  className="sidebar-nav-link"
                >
                  <img
                    src={p.cover}
                    alt={p.name}
                    style={{ width: 36, height: 28, objectFit: 'cover', borderRadius: 6, filter: 'brightness(0.7)', flexShrink: 0 }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text)', fontWeight: 600 }}>{p.title || p.name}</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .back-link:hover { color: var(--bronze) !important; }
        .sidebar-nav-link:hover { background: rgba(var(--bronze-rgb), 0.06) !important; border-radius: 6px; padding-right: 8px !important; }
        @media (max-width: 900px) {
          .project-detail-grid { grid-template-columns: 1fr !important; }
          .related-posts-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .project-detail-grid { grid-template-columns: 1fr 260px !important; gap: 20px !important; }
        }
      `}</style>
    </>
  );
}
