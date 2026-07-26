import React, { useEffect, useState } from 'react';
import { useKioskStore } from '../store/useKioskStore';
import { mediaService } from '../services/indexeddb/media.service';
import { X, Sparkles } from 'lucide-react';

export const ImageModal: React.FC = () => {
  const { galleryPreview, setGalleryPreview } = useKioskStore();
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setGalleryPreview(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setGalleryPreview]);

  useEffect(() => {
    let isMounted = true;
    let activeObjectUrl: string | null = null;

    async function resolveMediaUrl() {
      if (!galleryPreview) {
        if (isMounted) setResolvedImageUrl(null);
        return;
      }

      try {
        const cached = await mediaService.getGalleryMedia(galleryPreview.id);
        if (cached && cached.blob) {
          activeObjectUrl = URL.createObjectURL(cached.blob);
          if (isMounted) setResolvedImageUrl(activeObjectUrl);
        } else {
          if (isMounted) setResolvedImageUrl(galleryPreview.imageUrl);
        }
      } catch {
        if (isMounted) setResolvedImageUrl(galleryPreview.imageUrl);
      }
    }

    resolveMediaUrl();

    return () => {
      isMounted = false;
      if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
      }
    };
  }, [galleryPreview]);

  if (!galleryPreview) return null;

  const displaySrc = resolvedImageUrl || galleryPreview.imageUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              {galleryPreview.title}
            </h3>
          </div>
          <button
            onClick={() => setGalleryPreview(null)}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
          <img
            src={displaySrc}
            alt={galleryPreview.title}
            className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
          />
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Synced across all connected sales screens</span>
          <span className="font-mono text-slate-500">Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
