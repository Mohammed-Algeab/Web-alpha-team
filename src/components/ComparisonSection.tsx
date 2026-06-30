import { useState, useRef, useCallback } from 'react';
import type { Comparison } from '@/types';

interface ComparisonSectionProps {
  comparisons: Comparison[];
}

function ComparisonSlider({ comparison }: { comparison: Comparison }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-lg overflow-hidden cursor-ew-resize select-none"
      style={{ border: '1px solid var(--bronze)' }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      {/* After image (full) */}
      <img
        src={comparison.after_image}
        alt="بعد التعريب"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={comparison.before_image}
          alt="قبل التعريب"
          className="absolute inset-0 h-full object-cover"
          style={{ width: `${100 / (sliderPosition / 100 || 0.01)}%`, maxWidth: 'none' }}
          draggable={false}
        />
      </div>

      {/* Slider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{
          left: `${sliderPosition}%`,
          backgroundColor: 'var(--bronze)',
          transform: 'translateX(-50%)',
        }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: 'var(--bronze)',
            color: 'var(--bg)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M4 2L1 6L4 10M8 2L11 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontFamily: 'Cairo' }}
      >
        أصلي
      </div>
      <div
        className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-bold"
        style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.8)', color: 'var(--bg)', fontFamily: 'Cairo' }}
      >
        معرب
      </div>

      {/* Caption */}
      {comparison.caption && (
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-2 text-center text-sm"
          style={{ backgroundColor: 'rgba(14, 12, 10, 0.7)', color: 'var(--text)' }}
        >
          {comparison.caption}
        </div>
      )}
    </div>
  );
}

export default function ComparisonSection({ comparisons }: ComparisonSectionProps) {
  if (!comparisons || comparisons.length === 0) return null;

  return (
    <section className="mb-8">
      <h2
        className="text-xl font-bold mb-4"
        style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}
      >
        مقارنة الترجمة
      </h2>
      <div className="space-y-6">
        {comparisons.map((comp) => (
          <ComparisonSlider key={comp.id} comparison={comp} />
        ))}
      </div>
    </section>
  );
}
