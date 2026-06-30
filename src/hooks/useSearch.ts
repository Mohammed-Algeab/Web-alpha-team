import { useState, useCallback, useRef } from 'react';
import { supabase, supabaseConfigured } from '@/lib/supabase';
import type { SearchResult } from '@/types';

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
}

const initialState: SearchState = {
  results: [],
  loading: false,
  error: null,
  query: '',
};

// Debounce utility
function useDebounce<T extends (...args: any[]) => void>(callback: T, delay: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  return useCallback((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
}

export function useSearch() {
  const [state, setState] = useState<SearchState>(initialState);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setState(initialState);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, query }));

    try {
      // If Supabase is configured, use the database function
      if (supabaseConfigured) {
        const { data, error } = await supabase.rpc('search_content', { query: query.trim() });
        if (error) throw error;
        setState(prev => ({
          ...prev,
          results: (data || []) as SearchResult[],
          loading: false,
        }));
        return;
      }

      // Fallback: client-side search from loaded data
      // This requires the consumer to have data available
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: 'البحث المتقدم يتطلب الاتصال بقاعدة البيانات',
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'خطأ في البحث';
      setState(prev => ({ ...prev, error: msg, loading: false }));
    }
  }, []);

  const debouncedSearch = useDebounce(performSearch, 300);

  const clearSearch = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    search: debouncedSearch,
    searchImmediate: performSearch,
    clearSearch,
  };
}

// Client-side search for offline mode
export function useClientSearch(
  projects: Array<{ id: string; name: string; title?: string; description: string }>,
  posts: Array<{ id: string; title: string; excerpt: string; slug: string }>,
  independent: Array<{ id: string; name: string; description: string }>
) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');

  const search = useCallback((q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    const normalized = q.toLowerCase().trim();
    const matches: SearchResult[] = [];

    projects.forEach(p => {
      const text = `${p.name} ${p.title || ''} ${p.description}`.toLowerCase();
      if (text.includes(normalized)) {
        matches.push({
          type: 'project',
          id: p.id,
          title: p.title || p.name,
          description: p.description.substring(0, 200),
          slug: p.id,
          rank: text.split(normalized).length - 1,
        });
      }
    });

    posts.forEach(p => {
      const text = `${p.title} ${p.excerpt}`.toLowerCase();
      if (text.includes(normalized)) {
        matches.push({
          type: 'post',
          id: p.id,
          title: p.title,
          description: p.excerpt,
          slug: p.slug,
          rank: text.split(normalized).length - 1,
        });
      }
    });

    independent.forEach(i => {
      const text = `${i.name} ${i.description}`.toLowerCase();
      if (text.includes(normalized)) {
        matches.push({
          type: 'independent',
          id: i.id,
          title: i.name,
          description: i.description.substring(0, 200),
          slug: i.id,
          rank: text.split(normalized).length - 1,
        });
      }
    });

    setResults(matches.sort((a, b) => b.rank - a.rank).slice(0, 30));
  }, [projects, posts, independent]);

  return { results, query, search };
}
