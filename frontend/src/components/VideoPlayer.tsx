import React, { useRef, useEffect } from 'react';
import { VideoItem } from '../types';
import { useKioskStore } from '../store/useKioskStore';
import { Play, Pause, X, Film, Volume2, VolumeX } from 'lucide-react';

interface VideoPlayerProps {
  videos: VideoItem[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videos }) => {
  const { videoPlayback, setVideoPlayback } = useKioskStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = React.useState(false);

  const activeVideo = videos.find((v) => v.id === videoPlayback?.videoId) || null;

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

  const handleTimeUpdate = () => {
    // Optionally throttle time update syncs
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Property Video Showcase
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronized video walkthroughs for sales presentations
          </p>
        </div>
      </div>

      {/* Main Player Display */}
      {activeVideo && videoPlayback && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl glass-panel animate-fadeIn">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={activeVideo.videoUrl}
              poster={activeVideo.thumbnail}
              muted={muted}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setVideoPlayback(null)}
              className="w-full h-full object-contain"
            />

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

          return (
            <div
              key={video.id}
              onClick={() => handleSelectVideo(video)}
              className={`group relative rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 ${
                isCurrent
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-2 ring-indigo-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="relative h-44 overflow-hidden">
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
              </div>

              <div className="p-4">
                <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  <Film className="w-3 h-3 mr-1" /> HD Video Tour
                </span>
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
