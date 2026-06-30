// Initialize theme on load (Phase 6.2: Light/Dark mode support)
import { initTheme } from '@/hooks/useTheme';
initTheme();

import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useData } from '@/hooks/useData';
import { useSiteFeatures } from '@/hooks/useSiteFeatures';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import HomePage from '@/pages/HomePage';
import ProjectsPage from '@/pages/ProjectsPage';
import ProjectDetailPage from '@/pages/ProjectDetailPage';
import VersionsPage from '@/pages/VersionsPage';
import BlogPage from '@/pages/BlogPage';
import PostDetailPage from '@/pages/PostDetailPage';
import DownloadsPage from '@/pages/DownloadsPage';
import IndependentPage from '@/pages/IndependentPage';
import SearchPage from '@/pages/SearchPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import RoadmapPage from '@/pages/RoadmapPage';
import GlossaryPage from '@/pages/GlossaryPage';
import FAQPage from '@/pages/FAQPage';
import JoinTeamPage from '@/pages/JoinTeamPage';
import AdminPage from '@/pages/AdminPage';
import FeaturedProjectsPage from '@/pages/FeaturedProjectsPage';
import './index.css';
import './App.css';

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--text-secondary)' }}>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}>
          404
        </h1>
        <p className="mb-6">الصفحة غير موجودة</p>
        <a href="#/" className="btn-bronze text-sm">العودة للرئيسية</a>
      </div>
    </div>
  );
}

function App() {
  const {
    settings, projects, posts, downloads, independent, team,
    tags, glossary, faq, credits, changelogs, postCategories, loading, error,
    hasMorePosts, hasMoreDownloads, loadingMorePosts, loadingMoreDownloads,
    loadMorePosts, loadMoreDownloads,
  } = useData();

  const siteFeatures = useSiteFeatures();

  // V4: Auth state is managed via Supabase Auth + admin_users table
  // No longer uses sessionStorage or VITE_ADMIN_PASSWORD
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is an active admin (V5: using auth_user_id)
    async function checkAdmin() {
      if (!supabaseConfigured) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from('admin_users')
          .select('status')
          .eq('auth_user_id', session.user.id)
          .single();
        if (data?.status === 'active') {
          setIsAdmin(true);
        }
      }
    }
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--text-secondary)' }}
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--bronze)', borderTopColor: 'transparent' }}
          />
          <p>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'var(--bg)', color: 'var(--error)' }}
      >
        <div className="text-center">
          <p className="text-lg mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-bronze text-sm">
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Helmet
        titleTemplate={`%s | ${settings?.site_name || 'فريق ألفا للتعريب'}`}
        defaultTitle={settings?.site_name || 'فريق ألفا للتعريب'}
      >
        <html lang="ar" dir="rtl" />
        <meta name="description" content={settings?.tagline || 'نُعرِّب ما تحبه — بالعربية التي تستحقه'} />
        <meta name="theme-color" content="#0E0C0A" />
        <meta property="og:site_name" content={settings?.site_name || 'فريق ألفا للتعريب'} />
      </Helmet>

      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <Header features={siteFeatures} isAdmin={isAdmin} />
        <main>
          <AnimatePresence mode="wait">
            <Routes>
              <Route
                path="/"
                element={
                  <PageTransition>
                    <HomePage
                      settings={settings}
                      projects={projects}
                      posts={posts}
                      independent={independent}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/projects"
                element={
                  <PageTransition>
                    <ProjectsPage projects={projects} />
                  </PageTransition>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <PageTransition>
                    <ProjectDetailPage
                      projects={projects}
                      posts={posts}
                      changelogs={changelogs}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/versions/:id"
                element={
                  <PageTransition>
                    <VersionsPage projects={projects} changelogs={changelogs} />
                  </PageTransition>
                }
              />
              <Route
                path="/blog"
                element={
                  <PageTransition>
                    <BlogPage
                      posts={posts}
                      tags={tags}
                      projects={projects}
                      postCategories={postCategories}
                      hasMore={hasMorePosts}
                      loadingMore={loadingMorePosts}
                      onLoadMore={loadMorePosts}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/blog/:id"
                element={
                  <PageTransition>
                    <PostDetailPage posts={posts} />
                  </PageTransition>
                }
              />
              <Route
                path="/downloads"
                element={
                  <PageTransition>
                    <DownloadsPage
                      downloads={downloads}
                      projects={projects}
                      hasMore={hasMoreDownloads}
                      loadingMore={loadingMoreDownloads}
                      onLoadMore={loadMoreDownloads}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/independent"
                element={
                  <PageTransition>
                    <IndependentPage independent={independent} settings={settings} />
                  </PageTransition>
                }
              />
              <Route
                path="/glossary"
                element={
                  <PageTransition>
                    <GlossaryPage glossary={glossary} projects={projects} />
                  </PageTransition>
                }
              />
              <Route
                path="/roadmap"
                element={
                  <PageTransition>
                    <RoadmapPage projects={projects} />
                  </PageTransition>
                }
              />
              <Route
                path="/search"
                element={
                  <PageTransition>
                    <SearchPage
                      projects={projects}
                      posts={posts}
                      independent={independent}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/about"
                element={
                  <PageTransition>
                    <AboutPage
                      settings={settings}
                      team={team}
                      projects={projects}
                      credits={credits}
                      features={{ credits_section: siteFeatures.credits_section }}
                    />
                  </PageTransition>
                }
              />
              <Route
                path="/contact"
                element={
                  <PageTransition>
                    <ContactPage settings={settings} />
                  </PageTransition>
                }
              />
              <Route
                path="/featured"
                element={
                  <PageTransition>
                    <FeaturedProjectsPage projects={projects} />
                  </PageTransition>
                }
              />
              <Route
                path="/faq"
                element={
                  <PageTransition>
                    <FAQPage faq={faq} enabled={siteFeatures.faq_page} />
                  </PageTransition>
                }
              />
              <Route
                path="/join"
                element={
                  <PageTransition>
                    <JoinTeamPage settings={settings} enabled={siteFeatures.join_team_page} />
                  </PageTransition>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminPage
                    settings={settings}
                    projects={projects}
                    posts={posts}
                    downloads={downloads}
                    glossary={glossary}
                    faq={faq}
                    changelogs={changelogs}
                    postCategories={postCategories}
                    team={team}
                    independent={independent}
                  />
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer settings={settings} features={siteFeatures} />
      </div>
    </Router>
  );
}

export default App;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </StrictMode>
);