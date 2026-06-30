import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import type { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="a-card"
      style={{
        border: `1px solid ${hovered ? 'rgba(var(--bronze-rgb), 0.4)' : 'rgba(var(--bronze-rgb), 0.12)'}`,
        background: 'var(--card-surface)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 50px rgba(var(--bronze-rgb), 0.1)'
          : '0 4px 20px rgba(0,0,0,0.15)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Date */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Calendar size={13} style={{ color: 'var(--bronze)', opacity: 0.55 }} />
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
          {new Date(post.date).toLocaleDateString('en-US')}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontWeight: 700,
          fontSize: '1.05rem',
          lineHeight: 1.45,
          marginBottom: 10,
          color: 'var(--text)',
          fontFamily: 'Cairo, sans-serif',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {post.title}
      </h3>

      {/* Excerpt */}
      <p
        style={{
          fontSize: '0.82rem',
          lineHeight: 1.7,
          marginBottom: 16,
          color: 'var(--text-secondary)',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {post.excerpt}
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {post.tags.slice(0, 3).map((tag) => (
          <Link
            key={tag}
            to={`/search?tag=${encodeURIComponent(tag)}`}
            className="a-tag"
            style={{ textDecoration: 'none' }}
          >
            {tag}
          </Link>
        ))}
      </div>

      {/* Read more */}
      <Link
        to={`/blog/${post.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--bronze)',
          opacity: hovered ? 1 : 0.6,
          transition: 'opacity 0.3s ease',
          textDecoration: 'none',
          marginTop: 'auto',
        }}
      >
        <span>اقرأ المزيد</span>
        <ArrowLeft size={14} />
      </Link>
    </div>
  );
}
