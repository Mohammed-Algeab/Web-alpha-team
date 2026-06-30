import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  projectName?: string;
}

export default function ImageGallery({ images, projectName }: ImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + images.length) % images.length);
    }
  };

  return (
    <>
      {/* Gallery Grid */}
      <section className="mb-8">
        <h2
          className="text-xl font-bold mb-4"
          style={{ fontFamily: 'Cairo', color: 'var(--bronze)' }}
        >
          من داخل اللعبة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openLightbox(index)}
              style={{ border: '1px solid var(--bronze)' }}
            >
              <img
                src={img}
                alt={`${projectName || 'صورة'} ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full transition-colors"
            style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.2)', color: 'var(--bronze)' }}
          >
            <X size={24} />
          </button>

          {/* Image counter */}
          <div
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm"
            style={{
              backgroundColor: 'rgba(var(--bronze-rgb), 0.2)',
              color: 'var(--bronze)',
              fontFamily: 'Cairo',
            }}
          >
            {lightboxIndex + 1} / {images.length}
          </div>

          {/* Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.2)', color: 'var(--bronze)' }}
              >
                <ChevronRight size={28} />
              </button>
              <button
                onClick={goNext}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(var(--bronze-rgb), 0.2)', color: 'var(--bronze)' }}
              >
                <ChevronLeft size={28} />
              </button>
            </>
          )}

          {/* Image */}
          <img
            src={images[lightboxIndex]}
            alt={`${projectName || 'صورة'} ${lightboxIndex + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
