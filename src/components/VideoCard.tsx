import React, { useState } from 'react';
import { VideoInfo } from '../types';
import { Play, Eye, Clock, User, Image, ExternalLink, Sparkles } from 'lucide-react';

interface VideoCardProps {
  info: VideoInfo;
  onOpenAiSummary?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ info, onOpenAiSummary }) => {
  const [showEmbed, setShowEmbed] = useState<boolean>(false);

  const handleDownloadThumbnail = (url: string, qualityName: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${info.title.replace(/[^a-zA-Z0-9]/g, '_')}_Thumbnail_${qualityName}.jpg`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
      
      {/* Video Media Container */}
      <div className="relative aspect-video w-full bg-slate-950 group overflow-hidden">
        {showEmbed ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${info.videoId}?autoplay=1`}
            title={info.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={info.thumbnails.maxres || info.thumbnails.hq}
              alt={info.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                // Fallback to HQ image if MaxRes is not available
                (e.target as HTMLImageElement).src = info.thumbnails.hq;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

            {/* Play Button Overlay */}
            <button
              onClick={() => setShowEmbed(true)}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-950/60 scale-95 group-hover:scale-110 transition-all duration-300"
            >
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </button>

            {/* Duration Badge */}
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md text-white text-xs font-mono font-bold rounded-lg border border-white/10 flex items-center gap-1">
              <Clock className="w-3 h-3 text-red-400" />
              <span>{info.durationFormatted}</span>
            </div>
          </div>
        )}
      </div>

      {/* Video Information Body */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-red-500" />
              <span className="font-semibold">{info.channel}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 font-mono">
              <Eye className="w-3.5 h-3.5" />
              <span>{info.views}</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white line-clamp-2 leading-snug">
            {info.title}
          </h2>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {info.description || 'Standalone downloadable YouTube video.'}
          </p>
        </div>

        {/* Action Tools: AI Summary & Thumbnail Downloader */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
          {onOpenAiSummary && (
            <button
              onClick={onOpenAiSummary}
              className="w-full py-2 px-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Generate AI Video Summary & Chapters</span>
            </button>
          )}

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 font-medium">
              <Image className="w-3.5 h-3.5 text-slate-400" />
              <span>Thumbnails:</span>
            </span>
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={() => handleDownloadThumbnail(info.thumbnails.maxres, '1080p')}
                className="hover:text-red-400 transition-colors underline decoration-slate-700"
              >
                1080p HD
              </button>
              <span>·</span>
              <button
                onClick={() => handleDownloadThumbnail(info.thumbnails.hq, '720p')}
                className="hover:text-red-400 transition-colors underline decoration-slate-700"
              >
                720p
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
