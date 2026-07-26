import React, { useRef, useEffect, useState } from 'react';
import { VideoItem } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { mediaService } from '../services/indexeddb/media.service';
import { Play, Pause, X, Film, Volume2, VolumeX, Check, VideoOff } from 'lucide-react';
import Axios from 'axios';

interface VideoPlayerProps {
  videos: VideoItem[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos }) => {
  const { videoPlayback, setVideoPlayback, isOnline } = useKioskStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [cachedMap, setCachedMap] = useState<Record<number, { isCached: boolean; displayUrl: string | null }>>({});

  const activeVideo = videos.find((v) => v.id === videoPlayback?.videoId) || null;

  // Process video blob downloads & IndexedDB cache
  useEffect(() => {
    let isMounted = true;

    async function processVideoItems() {
      const updatedMap: Record<number, { isCached: boolean; displayUrl: string | null }> = {};

      for (const video of videos) {
        try {
          const cached = await mediaService.getVideoMedia(video.id);
          if (cached && cached.blob) {
            const objectUrl = URL.createObjectURL(cached.blob);
            updatedMap[video.id] = { isCached: true, displayUrl: objectUrl };
          } else if (isOnline) {
            try {
              const res = await Axios.get(video.videoUrl, { responseType: 'blob' });
              const blob: Blob = res.data;
              await mediaService.saveVideoMedia(video.id, video.videoUrl, blob);
              const objectUrl = URL.createObjectURL(blob);
              updatedMap[video.id] = { isCached: true, displayUrl: objectUrl };
            } catch {
              updatedMap[video.id] = { isCached: false, displayUrl: video.videoUrl };
            }
          } else {
            updatedMap[video.id] = { isCached: false, displayUrl: null };
          }
        } catch {
          updatedMap[video.id] = { isCached: false, displayUrl: video.videoUrl };
        }
      }

      if (isMounted) {
        setCachedMap(updatedMap);
      }
    }

    processVideoItems();

    return () => {
      isMounted = false;
      Object.values(cachedMap).forEach((val) => {
        if (val.displayUrl && val.displayUrl.startsWith('blob:')) {
          URL.revokeObjectURL(val.displayUrl);
        }
      });
    };
  }, [videos, isOnline]);

  // Handle HTML5 video sync
  useEffect(() => {
    if (videoRef.current && videoPlayback) {
      if (Math.abs(videoRef.current.currentTime - videoPlayback.currentTime) > 1.5) {
        videoRef.current.currentTime = videoPlayback.currentTime;
      }
      if (videoPlayback.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!videoPlayback.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    }
  }, [videoPlayback]);

  const handleSelectVideo = (video: VideoItem) => {
    const cacheInfo = cachedMap[video.id];

    if (!isOnline && !cacheInfo?.isCached) {
      return;
    }

    setVideoPlayback({
      videoId: video.id,
      title: video.title,
      videoUrl: video.videoUrl,
      isPlaying: true,
      currentTime: 0,
    });
  };

  const togglePlayPause = () => {
    if (!videoPlayback || !activeVideo) return;
    const isCurrentlyPlaying = videoPlayback.isPlaying;
    const currentTime = videoRef.current ? videoRef.current.currentTime : 0;

    setVideoPlayback({
      ...videoPlayback,
      isPlaying: !isCurrentlyPlaying,
      currentTime,
    });
  };

  const activeCacheInfo = activeVideo ? cachedMap[activeVideo.id] : null;
  const activeDisplayUrl = activeCacheInfo?.displayUrl || (activeVideo ? activeVideo.videoUrl : '');

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Property Video Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time synchronized video walkthroughs (IndexedDB Offline Cached)
          </p>
        </div>
      </div>

      {/* Main Player Display */}
      {activeVideo && videoPlayback && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl glass-panel animate-fadeIn">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {!isOnline && !activeCacheInfo?.isCached ? (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center text-slate-400">
                <VideoOff className="w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 text-rose-400 opacity-60 animate-pulse" />
                <h4 className="text-sm sm:text-base font-bold text-white mb-1">This media is not available offline.</h4>
                <p className="text-xs text-slate-500">Please connect to the internet to download this video.</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={activeDisplayUrl}
                poster={activeVideo.thumbnail}
                muted={muted}
                onEnded={() => setVideoPlayback(null)}
                className="w-full h-full object-contain"
              />
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent p-3 sm:p-6 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                <button
                  onClick={togglePlayPause}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95 shrink-0"
                >
                  {videoPlayback.isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-white truncate">{activeVideo.title}</h3>
                  <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium hidden sm:inline">
                    ● Real-Time Playback Synced
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </button>

                <button
                  onClick={() => setVideoPlayback(null)}
                  className="p-2 sm:p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {videos.map((video) => {
          const isCurrent = videoPlayback?.videoId === video.id;
          const cacheInfo = cachedMap[video.id];
          const isCached = cacheInfo?.isCached || false;
          const isUncachedOffline = !isOnline && !isCached;

          return (
            <div
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 ${
                isUncachedOffline
                  ? 'bg-slate-950 border-slate-800/60 cursor-not-allowed opacity-75'
                  : isCurrent
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40 cursor-pointer'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 cursor-pointer'
              }`}
            >
              <div className="relative h-36 sm:h-44 overflow-hidden">
                {isUncachedOffline ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-3">
                    <VideoOff className="w-7 h-7 sm:w-8 sm:h-8 mb-1 text-rose-400 opacity-50" />
                    <span className="text-[10px] sm:text-[11px] font-semibold text-rose-300">This media is not available offline.</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Film className="w-3 h-3 mr-1" /> HD Video Tour
                  </span>

                  {isCached && (
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3 h-3 mr-0.5" /> Offline
                    </span>
                  )}
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {video.title}
                </h4>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
