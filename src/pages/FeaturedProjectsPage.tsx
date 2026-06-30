import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/types';

interface FeaturedProjectsPageProps {
  projects: Project[];
}

export default function FeaturedProjectsPage({ projects }: FeaturedProjectsPageProps) {
  const featuredProjects = projects
    .filter(p => p.featured)
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-limit mx-auto px-4 sm:px-6">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm mb-6 transition-colors hover:text-[var(--bronze)]"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowRight size={16} />
          <span>العودة للرئيسية</span>
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-bold mb-8"
          style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}
        >
          المشاريع المميزة
        </h1>

        {featuredProjects.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: 'var(--text-secondary)' }}>لا توجد مشاريع مميزة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
