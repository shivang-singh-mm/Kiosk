import React, { useEffect, useState } from 'react';
import { GalleryItem } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { mediaService } from '../services/indexeddb/media.service';
import { Maximize2, Check, ImageOff } from 'lucide-react';
import Axios from 'axios';

interface GalleryGridProps {
  items: GalleryItem[];
}

export const GalleryGrid: React.FC<GalleryGridProps> = ({ items }) => {
  const { setGalleryPreview, isOnline } = useKioskStore();
  const [cachedMap, setCachedMap] = useState<Record<number, { isCached: boolean; displayUrl: string | null }>>({});

  useEffect(() => {
    let isMounted = true;

    async function processGalleryItems() {
      const updatedMap: Record<number, { isCached: boolean; displayUrl: string | null }> = {};

      for (const item of items) {
        try {
          // Check IndexedDB cache first
          const cached = await mediaService.getGalleryMedia(item.id);
          if (cached && cached.blob) {
            const objectUrl = URL.createObjectURL(cached.blob);
            updatedMap[item.id] = { isCached: true, displayUrl: objectUrl };
          } else if (isOnline) {
            // Download blob & save to IndexedDB
            try {
              const res = await Axios.get(item.imageUrl, { responseType: 'blob' });
              const blob: Blob = res.data;
              await mediaService.saveGalleryMedia(item.id, item.imageUrl, blob);
              const objectUrl = URL.createObjectURL(blob);
              updatedMap[item.id] = { isCached: true, displayUrl: objectUrl };
            } catch {
              updatedMap[item.id] = { isCached: false, displayUrl: item.imageUrl };
            }
          } else {
            updatedMap[item.id] = { isCached: false, displayUrl: null };
          }
        } catch {
          updatedMap[item.id] = { isCached: false, displayUrl: item.imageUrl };
        }
      }

      if (isMounted) {
        setCachedMap(updatedMap);
      }
    }

    processGalleryItems();

    return () => {
      isMounted = false;
      // Revoke created object URLs on unmount
      Object.values(cachedMap).forEach((val) => {
        if (val.displayUrl && val.displayUrl.startsWith('blob:')) {
          URL.revokeObjectURL(val.displayUrl);
        }
      });
    };
  }, [items, isOnline]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Architectural Photo Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            High-resolution interior & exterior residence views (IndexedDB Offline Cached)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item) => {
          const cacheInfo = cachedMap[item.id];
          const isCached = cacheInfo?.isCached || false;
          const displayUrl = cacheInfo?.displayUrl || item.imageUrl;
          const isNotAvailableOffline = !isOnline && !isCached;

          return (
            <div
              key={item.id}
              onClick={() => {
                if (!isNotAvailableOffline) {
                  setGalleryPreview({ ...item, imageUrl: displayUrl });
                }
              }}
              className={`group relative h-52 sm:h-64 rounded-2xl overflow-hidden border transition-all ${
                isNotAvailableOffline
                  ? 'bg-slate-950 border-slate-800/60 cursor-not-allowed opacity-75'
                  : 'cursor-pointer border-slate-800 bg-slate-900 shadow-xl hover:border-slate-700'
              }`}
            >
              {isNotAvailableOffline ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-slate-950/90 text-slate-500">
                  <ImageOff className="w-8 h-8 sm:w-10 sm:h-10 mb-2 opacity-40 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-300">This media is not available offline.</span>
                </div>
              ) : (
                <img
                  src={displayUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              )}

              {/* Gradient Overlay */}
              {!isNotAvailableOffline && (
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              )}

              <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  {/* Cached Badge */}
                  {isCached ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm backdrop-blur-md">
                      <Check className="w-3 h-3 mr-0.5" /> Available Offline
                    </span>
                  ) : (
                    <div />
                  )}

                  {!isNotAvailableOffline && (
                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                      <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
