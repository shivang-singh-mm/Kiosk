import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getGallery } from '../services/api';
import { GalleryGrid } from '../components/GalleryGrid';
import { ImageModal } from '../components/ImageModal';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useKioskStore } from '../store/useKioskStore';
import { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const { isOnline } = useKioskStore();
  const [offlineGallery, setOfflineGallery] = useState<GalleryItem[] | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['gallery'],
    queryFn: getGallery,
    enabled: isOnline,
  });

  useEffect(() => {
    async function loadOfflineItems() {
      if (!isOnline) {
        try {
          const db = await import('../services/indexeddb/db').then((m) => m.getDB());
          const records = await db.getAll('galleryCache');
          if (records && records.length > 0) {
            const items: GalleryItem[] = records.map((r) => ({
              id: r.id,
              title: `Cached Image #${r.id}`,
              imageUrl: r.url,
            }));
            setOfflineGallery(items);
          } else {
            setOfflineGallery([]);
          }
        } catch {
          setOfflineGallery([]);
        }
      }
    }

    loadOfflineItems();
  }, [isOnline]);

  if (isOnline && isLoading) return <Loader label="Loading Architectural Gallery..." />;
  if (isOnline && (isError || !data)) return <ErrorState onRetry={() => refetch()} />;

  const displayItems = isOnline ? (data || []) : (offlineGallery || []);

  if (!isOnline && displayItems.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">You are currently offline</h3>
        <p className="text-xs text-slate-500">No cached gallery images available offline.</p>
      </div>
    );
  }

  return (
    <>
      <GalleryGrid items={displayItems} />
      <ImageModal />
    </>
  );
};

