import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVideos } from '../services/api';
import { VideoPlayer } from '../components/VideoPlayer';
import { Loader } from '../components/Loader';
import { ErrorState } from '../components/ErrorState';
import { useKioskStore } from '../store/useKioskStore';
import { VideoItem } from '../types';

export const VideosPage: React.FC = () => {
  const { isOnline } = useKioskStore();
  const [offlineVideos, setOfflineVideos] = useState<VideoItem[] | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
    enabled: isOnline,
  });

  useEffect(() => {
    async function loadOfflineItems() {
      if (!isOnline) {
        try {
          const db = await import('../services/indexeddb/db').then((m) => m.getDB());
          const records = await db.getAll('videoCache');
          if (records && records.length > 0) {
            const items: VideoItem[] = records.map((r) => ({
              id: r.id,
              title: `Cached Video Tour #${r.id}`,
              thumbnail: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
              videoUrl: r.url,
            }));
            setOfflineVideos(items);
          } else {
            setOfflineVideos([]);
          }
        } catch {
          setOfflineVideos([]);
        }
      }
    }

    loadOfflineItems();
  }, [isOnline]);

  if (isOnline && isLoading) return <Loader label="Loading Video Showcase..." />;
  if (isOnline && (isError || !data)) return <ErrorState onRetry={() => refetch()} />;

  const displayVideos = isOnline ? (data || []) : (offlineVideos || []);

  if (!isOnline && displayVideos.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <h3 className="text-lg font-bold text-white mb-2">You are currently offline</h3>
        <p className="text-xs text-slate-500">No cached video tours available offline.</p>
      </div>
    );
  }

  return <VideoPlayer videos={displayVideos} />;
};
