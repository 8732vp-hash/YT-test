import React, { useState } from 'react';
import { BatchItem } from '../types';
import { Layers, Plus, Download, CheckCircle, AlertCircle, Trash2, Film, Music } from 'lucide-react';

interface BatchQueueProps {
  onAddHistoryItem: (item: any) => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({ onAddHistoryItem }) => {
  const [rawInput, setRawInput] = useState<string>('');
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [globalQuality, setGlobalQuality] = useState<string>('1080p');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleParseLinks = async () => {
    const lines = rawInput
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    setIsProcessing(true);
    try {
      const response = await fetch('/api/batch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: lines }),
      });

      if (response.ok) {
        const data = await response.json();
        const newItems: BatchItem[] = data.items.map((item: any) => ({
          ...item,
          selectedQuality: globalQuality,
          status: 'idle',
        }));
        setQueue((prev) => [...prev, ...newItems]);
        setRawInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setQueue((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setQueue([]);
  };

  const handleDownloadSingleBatch = async (index: number) => {
    const item = queue[index];
    if (!item.videoId || !item.valid) return;

    setQueue((prev) =>
      prev.map((it, i) => (i === index ? { ...it, status: 'downloading' } : it))
    );

    const quality = item.selectedQuality || globalQuality;
    const downloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&quality=${quality}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${item.title || 'Batch_Video'}_[${quality}].mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setQueue((prev) =>
        prev.map((it, i) => (i === index ? { ...it, status: 'completed' } : it))
      );

      onAddHistoryItem({
        id: `batch_${Date.now()}_${index}`,
        videoId: item.videoId!,
        title: item.title || 'Batch YouTube Video',
        channel: item.channel || 'YouTube',
        quality: quality,
        format: quality.startsWith('audio') ? 'MP3' : 'MP4',
        fileSizeMB: 45.0,
        downloadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnail: item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
        downloadUrl: downloadUrl,
      });
    }, 1200);
  };

  const handleDownloadAll = async () => {
    for (let i = 0; i < queue.length; i++) {
      if (queue[i].status !== 'completed' && queue[i].valid) {
        await handleDownloadSingleBatch(i);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Batch YouTube Downloader</h2>
              <p className="text-xs text-slate-400">Paste multiple YouTube video URLs (one per line) to download in bulk.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-mono">Bulk Resolution:</label>
            <select
              value={globalQuality}
              onChange={(e) => setGlobalQuality(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-white text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-red-500"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="720p">720p HD</option>
              <option value="480p">480p SD</option>
              <option value="360p">360p Mobile</option>
              <option value="audio-mp3">Audio MP3</option>
            </select>
          </div>
        </div>

        {/* Textarea for Multi-line URLs */}
        <div className="space-y-3">
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder={`https://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://www.youtube.com/watch?v=L_LUpnjgPso\nhttps://www.youtube.com/watch?v=fJ9rUzIMcZQ`}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-red-500 transition-all"
          ></textarea>

          <button
            onClick={handleParseLinks}
            disabled={isProcessing || !rawInput.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-950/50 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add URLs to Queue</span>
          </button>
        </div>

      </div>

      {/* Queue List */}
      {queue.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold font-mono text-slate-300">
              Queue ({queue.length} videos)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={handleDownloadAll}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {queue.map((item, index) => (
              <div key={index} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                    alt={item.title}
                    className="w-16 h-10 object-cover rounded-lg bg-slate-950 shrink-0 border border-slate-800"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {item.title || item.url}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.channel} · {item.durationFormatted}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono bg-slate-950 px-2 py-1 rounded text-red-400 border border-slate-800">
                    {item.selectedQuality || globalQuality}
                  </span>

                  <button
                    onClick={() => handleDownloadSingleBatch(index)}
                    disabled={item.status === 'downloading' || item.status === 'completed'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      item.status === 'completed'
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                        : item.status === 'downloading'
                        ? 'bg-amber-950/80 text-amber-400 animate-pulse'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {item.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Saved</span>
                      </>
                    ) : item.status === 'downloading' ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
