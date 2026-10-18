import React, { useState } from 'react';
import { VideoInfo, AiSummary } from '../types';
import { Sparkles, ListChecks, Clock, Tag, Quote, RefreshCw, Copy, Check } from 'lucide-react';

interface AiSummaryCardProps {
  info: VideoInfo;
}

export const AiSummaryCard: React.FC<AiSummaryCardProps> = ({ info }) => {
  const [summaryData, setSummaryData] = useState<AiSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedTag, setCopiedTag] = useState<boolean>(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: info.videoId,
          title: info.title,
          channel: info.channel,
          description: info.description,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');
      const data = await response.json();
      setSummaryData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyTags = () => {
    if (summaryData?.tags) {
      navigator.clipboard.writeText(summaryData.tags.join(', '));
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2000);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-amber-100" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Video Intelligence & Chapters</h3>
            <p className="text-xs text-slate-400">Powered by Gemini AI for instant key takeaways and video timestamps.</p>
          </div>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{summaryData ? 'Regenerate Analysis' : 'Analyze Video with AI'}</span>
            </>
          )}
        </button>
      </div>

      {!summaryData && !isLoading && (
        <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          <Sparkles className="w-8 h-8 text-amber-400/60 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Extract AI Highlights & Chapter Markers</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click the button above to generate bullet points, topic timestamps, quotes, and SEO tags for "{info.title}".
            </p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="py-12 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-slate-400">Gemini AI reading video title & content metadata...</p>
        </div>
      )}

      {summaryData && !isLoading && (
        <div className="space-y-6">
          {/* Executive Overview */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <span>Overview & Summary</span>
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
              {summaryData.summary}
            </p>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <ListChecks className="w-4 h-4" />
              <span>Key Highlights</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summaryData.keyTakeaways.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/60 text-[10px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Video Chapters */}
          {summaryData.chapters && summaryData.chapters.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Auto Chapters</span>
              </h4>
              <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800/60 overflow-hidden">
                {summaryData.chapters.map((ch, i) => (
                  <div key={i} className="flex items-center justify-between p-3 text-xs">
                    <span className="font-semibold text-white">{ch.title}</span>
                    <span className="px-2.5 py-1 bg-amber-950/80 text-amber-300 rounded font-mono font-bold text-[11px] border border-amber-800/40">
                      {ch.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags & Key Quote */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
            {summaryData.tags && summaryData.tags.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>Recommended Tags:</span>
                  </span>
                  <button
                    onClick={copyTags}
                    className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1"
                  >
                    {copiedTag ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTag ? 'Copied!' : 'Copy Tags'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {summaryData.tags.map((tag) => (
                    <span key={tag} className="text-[11px] font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
