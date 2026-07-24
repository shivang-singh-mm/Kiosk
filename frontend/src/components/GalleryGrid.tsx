import React from 'react';
import { GalleryItem } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { Maximize2, Eye } from 'lucide-react';

interface GalleryGridProps {
  items: GalleryItem[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
  const { setGalleryPreview } = useKioskStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Architectural Photo Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            High-resolution interior & exterior residence views (Real-time synced)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setGalleryPreview(item)}
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 bg-slate-900 shadow-xl"
          >
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <div className="flex justify-end">
                <span className="w-8 h-8 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>

              <div>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                  <Eye className="w-3 h-3 mr-1" /> Preview Ready
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {item.title}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
