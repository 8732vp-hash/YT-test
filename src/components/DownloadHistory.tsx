import React from 'react';
import { DownloadHistoryItem } from '../types';
import { History, Download, Trash2, Film, Music, Clock, FileVideo } from 'lucide-react';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onClearHistory }) => {
  if (history.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <History className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">No Downloads Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your recent video downloads and extracted audio tracks will be recorded here for instant access and re-downloading.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Download Log & Saved Library</h2>
              <p className="text-xs text-slate-400">Re-download past media files or clear saved download logs.</p>
            </div>
          </div>

          <button
            onClick={onClearHistory}
            className="px-3.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-rose-800/40 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {history.map((item) => {
            const isAudio = item.format === 'MP3';

            return (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-10 object-cover rounded-lg bg-slate-950 border border-slate-800"
                    />
                    <div className="absolute top-1 left-1 p-0.5 bg-black/80 rounded text-red-400">
                      {isAudio ? <Music className="w-2.5 h-2.5" /> : <Film className="w-2.5 h-2.5" />}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                      <span>{item.channel}</span>
                      <span>·</span>
                      <span className="text-amber-400">{item.quality}</span>
                      <span>·</span>
                      <span>{item.downloadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={item.downloadUrl}
                    download={`${item.title}_[${item.quality}].${item.format.toLowerCase()}`}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-red-950/50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Re-Download</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
