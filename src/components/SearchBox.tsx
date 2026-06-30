import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBox({ initialValue = '', onSearch, placeholder = 'ابحث في المشاريع والمنشورات...' }: SearchBoxProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full py-3 px-4 pr-12 rounded-lg text-base transition-all duration-200 outline-none"
          style={{
            color: 'var(--text)',
            border: '1px solid var(--bronze)',
            backgroundColor: 'rgba(var(--bronze-rgb), 0.08)',
          }}
          dir="rtl"
        />
        <button
          type="submit"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded transition-colors"
          style={{ color: 'var(--bronze)' }}
          aria-label="بحث"
        >
          <Search size={20} />
        </button>
      </div>
    </form>
  );
}
