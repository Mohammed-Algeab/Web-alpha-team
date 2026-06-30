export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string | null
          name: string
          type: string
          status: string
          progress: number
          featured: boolean
          cover: string
          description: string
          struggle_story: string | null
          latest_version: string
          download_link: string | null
          images: string[]
          comparisons: Json
          timeline: Json
          related_posts: string[]
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['projects']['Row']>
      }
      posts: {
        Row: {
          id: string
          title: string
          excerpt: string
          content: string
          date: string
          tags: string[]
          project_id: string | null
          category_id: string | null
          cover: string | null
          slug: string
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['posts']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['posts']['Row']>
      }
      downloads: {
        Row: {
          id: string
          title: string
          filename: string | null
          project_id: string
          changelog_id: string
          link: string
          notes: string | null
          type: string
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['downloads']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['downloads']['Row']>
      }
      post_categories: {
        Row: {
          id: string
          name: string
          slug: string
          color: string
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_categories']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['post_categories']['Row']>
      }
      independent: {
        Row: {
          id: string
          name: string
          title: string | null
          translator: string | null
          type: string
          description: string
          cover: string | null
          link: string
          status: string
          date: string
          created_at: string
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['independent']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['independent']['Row']>
      }
      team: {
        Row: {
          id: string
          name: string
          role: string
          avatar: string
          links: Json
          joined_date: string
          is_active: boolean
          display_order: number
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['team']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['team']['Row']>
      }
      glossary: {
        Row: {
          id: string
          term_original: string
          term_arabic: string
          reason: string | null
          project_id: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['glossary']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['glossary']['Row']>
      }
      faq: {
        Row: {
          id: string
          question: string
          answer: string
          order: number
          is_active: boolean
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['faq']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['faq']['Row']>
      }
      credits: {
        Row: {
          id: string
          name: string
          role: string
          project_id: string | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['credits']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['credits']['Row']>
      }
      changelogs: {
        Row: {
          id: string
          project_id: string
          version: string
          date: string
          changes: string[]
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['changelogs']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['changelogs']['Row']>
      }
      settings: {
        Row: {
          id: number
          site_name: string
          tagline: string
          telegram_channel: string
          telegram_group: string
          email: string | null
          featured_project: string | null
          site_description: string | null
          keywords: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['settings']['Row']>
      }
      site_features: {
        Row: {
          key: string
          enabled: boolean
          label: string
          description: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['site_features']['Row'], 'updated_at'> & { updated_at?: string }
        Update: Partial<Database['public']['Tables']['site_features']['Row']>
      }
      admin_users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          rank: string
          added_by: string | null
          status: string
          last_login: string | null
          login_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['admin_users']['Row'], 'login_count' | 'created_at' | 'updated_at'> & {
          login_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['admin_users']['Row']>
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          admin_email: string
          admin_rank: string
          action: string
          target_table: string | null
          target_record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: unknown | null
          user_agent: string | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['admin_logs']['Row'], 'created_at'> & { created_at?: string }
        Update: Partial<Database['public']['Tables']['admin_logs']['Row']>
      }
    }
    Views: {
      dashboard_stats: {
        Row: {
          total_projects: number
          active_projects: number
          completed_projects: number
          total_posts: number
          total_downloads: number
          team_members: number
          glossary_terms: number
          active_admins: number
          logs_24h: number
        }
      }
    }
    Functions: {
      search_content: {
        Args: { query: string }
        Returns: Array<{
          type: string
          id: string
          title: string
          description: string
          slug: string
          rank: number
        }>
      }
      update_updated_at_column: {
        Args: Record<string, never>
        Returns: void
      }
      cleanup_old_login_attempts: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
