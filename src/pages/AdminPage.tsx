// src/pages/AdminPage.tsx — ponytail: من 1797 إلى ~90 سطر
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, FolderOpen, BookOpen, Download as DownloadIcon, BookMarked, ClipboardList, ToggleLeft, LogOut, BarChart3, HelpCircle, Star, Users, Globe } from 'lucide-react';
import type { Project, Post, Download, GlossaryItem, ChangelogItem, Settings as SettingsType, FAQItem, PostCategory, TeamMember, Independent } from '@/types';
import { useAdminAuth, LoginScreen, TabButton } from './admin/_shared';
import { ProjectsTab }       from './admin/ProjectsTab';
import { PostsTab }          from './admin/PostsTab';
import { DownloadsTab }      from './admin/DownloadsTab';
import { GlossaryTab }       from './admin/GlossaryTab';
import { ChangelogsTab }     from './admin/ChangelogsTab';
import { FAQTab }            from './admin/FAQTab';
import { CreditsTab }        from './admin/CreditsTab';
import { DashboardStatsTab } from './admin/DashboardStatsTab';
import { SiteFeaturesTab }   from './admin/SiteFeaturesTab';
import { SettingsTab }       from './admin/SettingsTab';
import { AdminManageTab }    from './admin/AdminManageTab';
import { TeamTab }           from './admin/TeamTab';
import { IndependentTab }    from './admin/IndependentTab';

interface AdminPageProps {
  settings: SettingsType | null; projects: Project[]; posts: Post[]; downloads: Download[];
  glossary: GlossaryItem[]; faq: FAQItem[]; changelogs: ChangelogItem[];
  postCategories: PostCategory[]; team: TeamMember[]; independent: Independent[];
}

export default function AdminPage(props: AdminPageProps) {
  const { user, loading, login, logout, isSuperAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const navigate = useNavigate();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--bronze)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--text-secondary)' }}>جاري التحقق...</p>
      </div>
    </div>
  );

  if (!user) return <LoginScreen onLogin={login} />;

  const tabs = [
    { key: 'projects',    label: 'المشاريع',      icon: <FolderOpen size={16} /> },
    { key: 'posts',       label: 'المنشورات',     icon: <BookOpen size={16} /> },
    { key: 'downloads',   label: 'التحميلات',     icon: <DownloadIcon size={16} /> },
    { key: 'glossary',    label: 'المصطلحات',     icon: <BookMarked size={16} /> },
    { key: 'changelogs',  label: 'الإصدارات',     icon: <ClipboardList size={16} /> },
    { key: 'faq',         label: 'الأسئلة',       icon: <HelpCircle size={16} /> },
    { key: 'credits',     label: 'الشكر',         icon: <Star size={16} /> },
    { key: 'team',        label: 'الفريق',        icon: <Users size={16} /> },
    { key: 'independent', label: 'مستقلون',       icon: <Globe size={16} /> },
    { key: 'stats',       label: 'الإحصائيات',    icon: <BarChart3 size={16} /> },
    { key: 'features',    label: 'الأقسام',       icon: <ToggleLeft size={16} /> },
    { key: 'settings',    label: 'الإعدادات',     icon: <Settings size={16} /> },
    ...(isSuperAdmin ? [{ key: 'admins', label: 'المشرفين', icon: <Shield size={16} /> }] : []),
  ];

  return (
    <div className="min-h-screen pt-24 pb-16" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="container-limit mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(var(--bronze-rgb), 0.14)', border: '1px solid rgba(var(--bronze-rgb), 0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bronze)' }}><Shield size={22} /></div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Cairo', color: 'var(--text)' }}>لوحة التحكم</h1>
              <p className="text-xs" style={{ color: 'rgba(var(--text-rgb), 0.4)' }}>{user.display_name || user.email} • {user.rank === 'super_admin' ? 'مدير عام' : user.rank === 'admin' ? 'مشرف' : 'محرر'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="a-btn-outline" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
            <LogOut size={14} /> <span>خروج</span>
          </button>
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => <TabButton key={tab.key} active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)} icon={tab.icon} label={tab.label} />)}
        </div>
        <div>
          {activeTab === 'projects'    && <ProjectsTab      projects={props.projects} />}
          {activeTab === 'posts'       && <PostsTab         posts={props.posts} projects={props.projects} postCategories={props.postCategories} />}
          {activeTab === 'downloads'   && <DownloadsTab     downloads={props.downloads} projects={props.projects} changelogs={props.changelogs} />}
          {activeTab === 'glossary'    && <GlossaryTab      glossary={props.glossary} projects={props.projects} />}
          {activeTab === 'changelogs'  && <ChangelogsTab    changelogs={props.changelogs} projects={props.projects} />}
          {activeTab === 'faq'         && <FAQTab           faq={props.faq} />}
          {activeTab === 'credits'     && <CreditsTab       projects={props.projects} />}
          {activeTab === 'team'        && <TeamTab          team={props.team} />}
          {activeTab === 'independent' && <IndependentTab   independent={props.independent} />}
          {activeTab === 'stats'       && <DashboardStatsTab isSuperAdmin={isSuperAdmin} />}
          {activeTab === 'features'    && <SiteFeaturesTab />}
          {activeTab === 'settings'    && <SettingsTab      settings={props.settings} />}
          {activeTab === 'admins'      && <AdminManageTab   isSuperAdmin={isSuperAdmin} />}
        </div>
      </div>
    </div>
  );
}
