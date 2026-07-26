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
            // Attempt background caching of video blob
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
    const displayUrl = cacheInfo?.displayUrl || video.videoUrl;

    if (!isOnline && !cacheInfo?.isCached) {
      return;
    }

    setVideoPlayback({
      videoId: video.id,
      title: video.title,
      videoUrl: displayUrl,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Property Video Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronized video walkthroughs (IndexedDB Offline Cached)
          </p>
        </div>
      </div>

      {/* Main Player Display */}
      {activeVideo && videoPlayback && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl glass-panel animate-fadeIn">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {!isOnline && !activeCacheInfo?.isCached ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <VideoOff className="w-12 h-12 mb-3 text-rose-400 opacity-60 animate-pulse" />
                <h4 className="text-base font-bold text-white mb-1">This media is not available offline.</h4>
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
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-4 sm:p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 transition-transform active:scale-95"
                >
                  {videoPlayback.isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                <div>
                  <h3 className="text-sm font-bold text-white">{activeVideo.title}</h3>
                  <span className="text-[11px] text-emerald-400 font-medium">
                    ● Real-Time Playback Synced
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMuted(!muted)}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setVideoPlayback(null)}
                  className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="relative h-44 overflow-hidden">
                {isUncachedOffline ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-3">
                    <VideoOff className="w-8 h-8 mb-1 text-rose-400 opacity-50" />
                    <span className="text-[11px] font-semibold text-rose-300">This media is not available offline.</span>
                  </div>
                ) : (
                  <>
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors flex items-center justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Film className="w-3 h-3 mr-1" /> HD Video Tour
                  </span>

                  {isCached && (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Check className="w-3 h-3 mr-0.5" /> Available Offline
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
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
