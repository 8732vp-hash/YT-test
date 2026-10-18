import React, { useState } from 'react';
import { VideoResolution, VideoInfo } from '../types';
import { Download, Film, Music, Check, Sparkles, Clock, HardDrive, ShieldCheck, Scissors } from 'lucide-react';

interface ResolutionSelectorProps {
  info: VideoInfo;
  onStartDownload: (quality: string, clipStart: number | null, clipEnd: number | null) => void;
  isDownloading: boolean;
  downloadProgress: number;
  downloadStatus: string;
}

export const ResolutionSelector: React.FC<ResolutionSelectorProps> = ({
  info,
  onStartDownload,
  isDownloading,
  downloadProgress,
  downloadStatus,
}) => {
  const [selectedQuality, setSelectedQuality] = useState<string>('1080p');
  const [enableTrimmer, setEnableTrimmer] = useState<boolean>(false);
  const [clipStart, setClipStart] = useState<number>(0);
  const [clipEnd, setClipEnd] = useState<number>(info.duration || 180);

  const selectedRes = info.resolutions.find((r) => r.quality === selectedQuality) || info.resolutions[0];

  const handleDownloadClick = () => {
    onStartDownload(
      selectedQuality,
      enableTrimmer ? clipStart : null,
      enableTrimmer ? clipEnd : null
    );
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const effectiveDuration = enableTrimmer ? Math.max(5, clipEnd - clipStart) : (info.duration || 180);
  const clipRatio = (info.duration && info.duration > 0) ? (effectiveDuration / info.duration) : 1;
  const activeEstSizeMB = Math.max(0.5, Math.round(selectedRes.estSizeMB * clipRatio * 10) / 10);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-red-500" />
            <span>Select Video Definition & Format</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Choose your preferred video quality ranging from 360p to 1080p Full HD or extract audio.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg">
          <HardDrive className="w-3.5 h-3.5 text-slate-300" />
          <span>Standalone MP4/MP3</span>
        </div>
      </div>

      {/* Quality Grid Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {info.resolutions.map((res) => {
          const isSelected = res.quality === selectedQuality;
          const isAudio = res.quality.startsWith('audio');
          const estMB = Math.max(0.5, Math.round(res.estSizeMB * clipRatio * 10) / 10);

          return (
            <button
              key={res.quality}
              onClick={() => setSelectedQuality(res.quality)}
              className={`relative text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-slate-800/90 border-red-500/80 shadow-lg shadow-red-950/40 ring-1 ring-red-500/50'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
              }`}
            >
              {res.recommended && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                  ★ Recommended
                </span>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isAudio ? 'bg-amber-950/80 text-amber-400' : 'bg-red-950/80 text-red-400'
                    }`}
                  >
                    {isAudio ? <Music className="w-4 h-4" /> : <Film className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                      <span>{res.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {res.codec}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-red-500 bg-red-600 text-white'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span className="px-1.5 py-0.5 bg-slate-900 rounded text-[10px] text-slate-300 font-bold uppercase">
                  .{res.format.toLowerCase()}
                </span>
                <span>~{estMB} MB</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trimmer Clip Option Toggle */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableTrimmer}
              onChange={(e) => setEnableTrimmer(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              <span>Trim & Download Video Clip</span>
            </span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            Full Length: {info.durationFormatted}
          </span>
        </div>

        {enableTrimmer && (
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                <span>Start Time:</span>
                <span className="text-white font-bold">{formatSec(clipStart)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={clipEnd - 5}
                value={clipStart}
                onChange={(e) => setClipStart(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                <span>End Time:</span>
                <span className="text-white font-bold">{formatSec(clipEnd)}</span>
              </div>
              <input
                type="range"
                min={clipStart + 5}
                max={info.duration || 180}
                value={clipEnd}
                onChange={(e) => setClipEnd(Number(e.target.value))}
                className="w-full accent-red-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Selected Option Banner & Download Trigger Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
          <span>Target Resolution: <strong className="text-white">{selectedRes.label}</strong></span>
          <span>Est. File Size: <strong className="text-emerald-400">{activeEstSizeMB} MB</strong></span>
        </div>

        <button
          onClick={handleDownloadClick}
          disabled={isDownloading}
          className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-[0.99] disabled:opacity-75 disabled:scale-100 text-white font-bold rounded-xl shadow-xl shadow-red-950/50 transition-all flex items-center justify-center gap-2.5 text-base"
        >
          {isDownloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Packaging Standalone File... ({downloadProgress}%)</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>
                Download Standalone {selectedRes.quality.toUpperCase()} File
              </span>
            </>
          )}
        </button>

        {/* Real-time Progress Bar */}
        {isDownloading && (
          <div className="space-y-2 pt-1">
            <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${downloadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{downloadStatus}</span>
              <span className="text-amber-400 font-bold">{downloadProgress}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
