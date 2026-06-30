export interface Settings {
  site_name: string;
  tagline: string;
  telegram_channel: string;
  telegram_group: string;
  email: string | null;
  site_description: string;
  keywords: string;
}

export interface Project {
  id: string;
  name: string;              // الاسم الفني/SEO (مثل "fate-stay-night")
  title: string;             // الاسم المعروض (مثل "Fate/stay night — بالعربية")
  type: "تعريب" | "أداة" | "لعبة";
  status: "active" | "completed" | "upcoming" | "paused";
  cover: string;
  description: string;
  struggle_story: string | null;
  latest_version: string;
  download_link: string | null;
  progress: number;
  featured: boolean;
  display_order: number;     // لترتيب المشاريع المميزة
  images: string[] | null;
  comparisons: Comparison[] | null;
  timeline: TimelineItem[] | null;
  created_at: string;
}

export interface Comparison {
  id: string;
  before_image: string;
  after_image: string;
  caption: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  tags: string[];
  project_id: string | null;
  category_id: string | null;
  created_at: string;
}

export interface Download {
  id: string;
  title: string;
  project_id: string;
  changelog_id: string;
  link: string;
  filename: string | null;
  notes: string | null;
  type: string;
  status: string;
  created_at: string;
  // تُضاف عند الجلب عبر join مع changelogs — وليست عموداً فعلياً في الجدول
  changelog?: { version: string; date: string };
}

export interface PostCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  display_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  joined_date: string;
}

export interface Independent {
  id: string;
  name: string;
  type: string;
  description: string;
  cover: string | null;
  link: string;
  status: string;
  date: string;
}

export interface GlossaryItem {
  id: string;
  term_original: string;
  term_arabic: string;
  reason: string | null;
  project_id: string | null;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface CreditItem {
  id: string;
  name: string;
  role: string;
  project_id: string | null;
}

export interface ChangelogItem {
  id: string;
  project_id: string;
  version: string;
  date: string;
  changes: string[];
}

export interface SiteFeature {
  key: string;
  enabled: boolean;
  label: string;
}

export interface Tags {
  [key: string]: string;
}

export interface TimelineItem {
  date: string;
  version: string;
  notes: string;
}

export interface SearchResult {
  type: string;
  id: string;
  title: string;
  description: string;
  slug: string;
  rank: number;
}

export interface AdminLog {
  id: string;
  admin_email: string;
  admin_rank: string;
  action: string;
  target_table: string | null;
  target_record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
}

export interface AdminUser {
  auth_user_id: string | null;  // Phase 0.1: Unified auth via Supabase Auth user ID
  email: string;
  display_name: string | null;
  rank: 'super_admin' | 'admin' | 'editor';
  status: 'pending' | 'active' | 'suspended';
  last_login: string | null;
}
