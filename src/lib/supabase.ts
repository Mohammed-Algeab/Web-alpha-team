import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// V5: Edge Functions removed — using RLS-only approach
// All admin operations go through Supabase client with RLS policies
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : (null as unknown as SupabaseClient);

// To re-enable Edge Functions in the future:
// 1. Install Supabase CLI
// 2. Create functions in supabase/functions/
// 3. Deploy with: supabase functions deploy
// 4. Add edgeClient back here
