import React, { useState } from 'react';
import { Search, Link, Sparkles, X, ArrowRight, Play, CheckCircle2 } from 'lucide-react';

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
  currentUrl: string;
}

const SAMPLE_PRESETS = [
  { label: '4K Nature Demo', url: 'https://www.youtube.com/watch?v=L_LUpnjgPso' },
  { label: 'Rick Astley (1080p)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { label: 'Queen - Bohemian Rhapsody', url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ' },
  { label: 'First YouTube Video', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw' },
  { label: 'Google Developers I/O', url: 'https://www.youtube.com/watch?v=M7lc1UVf-VE' },
];

export const UrlInput: React.FC<UrlInputProps> = ({ onAnalyze, isLoading, currentUrl }) => {
  const [inputUrl, setInputUrl] = useState(currentUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyze(inputUrl.trim());
    }
  };

  const handlePresetSelect = (url: string) => {
    setInputUrl(url);
    onAnalyze(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text);
        onAnalyze(text);
      }
    } catch (err) {
      // Clipboard access fallback
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-70 transition duration-300"></div>
        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl">
          
          <div className="flex items-center gap-3 pl-3 pr-1 py-1 w-full flex-1">
            <Link className="w-5 h-5 text-red-500 shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste YouTube link here (e.g. https://www.youtube.com/watch?v=... or Video ID)"
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none py-2 font-mono"
            />
            {inputUrl && (
              <button
                type="button"
                onClick={() => setInputUrl('')}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="button"
              onClick={handlePaste}
              className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all border border-slate-700/50 whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
            >
              <span>Paste URL</span>
            </button>

            <button
              type="submit"
              disabled={isLoading || !inputUrl.trim()}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 disabled:opacity-50 disabled:scale-100 text-white text-sm font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Fetch Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </form>

      {/* Preset Quick Links */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs text-slate-400 pt-1">
        <span className="font-medium text-slate-500 shrink-0">Try Sample Videos:</span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePresetSelect(preset.url)}
              className="px-2.5 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all whitespace-nowrap text-[11px] font-medium flex items-center gap-1"
            >
              <Play className="w-2.5 h-2.5 text-red-500 fill-red-500" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
