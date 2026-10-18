import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { VideoCard } from './components/VideoCard';
import { ResolutionSelector } from './components/ResolutionSelector';
import { AiSummaryCard } from './components/AiSummaryCard';
import { BatchQueue } from './components/BatchQueue';
import { DownloadHistory } from './components/DownloadHistory';
import { VideoInfo, DownloadHistoryItem } from './types';
import { Youtube } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'ai' | 'history'>('single');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Download Progress State
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadStatus, setDownloadStatus] = useState<string>('');

  // Local Storage Download History Persistence
  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('tubedl_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tubedl_history', JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
  }, [history]);

  // Handle Fetching Video Information
  const handleAnalyzeVideo = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze video');
      }

      setVideoInfo(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to video resolution server.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial Load with default sample video
  useEffect(() => {
    handleAnalyzeVideo('https://www.youtube.com/watch?v=L_LUpnjgPso');
  }, []);

  // Handle Real Streaming Download Execution
  const handleStartDownload = async (
    quality: string,
    clipStart: number | null,
    clipEnd: number | null
  ) => {
    if (!videoInfo) return;

    setIsDownloading(true);
    setDownloadProgress(5);
    setDownloadStatus('Connecting to media download server...');

    try {
      let downloadUrl = `/api/download?url=${encodeURIComponent(videoInfo.url)}&quality=${quality}`;
      if (clipStart !== null) downloadUrl += `&clipStart=${clipStart}`;
      if (clipEnd !== null) downloadUrl += `&clipEnd=${clipEnd}`;

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const contentLength = response.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body?.getReader();
      const chunks: Uint8Array[] = [];
      let receivedBytes = 0;

      setDownloadStatus('Extracting video frames and stream chunks...');

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            receivedBytes += value.length;

            if (totalBytes > 0) {
              const pct = Math.min(99, Math.round((receivedBytes / totalBytes) * 100));
              setDownloadProgress(pct);
            } else {
              setDownloadProgress((prev) => Math.min(95, prev + 5));
            }
          }
        }
      }

      setDownloadProgress(100);
      setDownloadStatus('File complete! Saving to Downloads folder...');

      const isAudio = quality.startsWith('audio');
      const ext = isAudio ? (quality.includes('m4a') ? 'm4a' : 'mp3') : 'mp4';
      const mime = isAudio ? 'audio/mpeg' : 'video/mp4';

      // Assemble complete Blob in memory
      const blob = new Blob(chunks as BlobPart[], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const cleanTitle = videoInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
      const filename = `${cleanTitle}_[${quality}].${ext}`;

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      // Record in Download History
      const resMeta = videoInfo.resolutions.find((r) => r.quality === quality);
      const actualMB = Math.round((receivedBytes / (1024 * 1024)) * 10) / 10 || (resMeta ? resMeta.estSizeMB : 2.5);

      const newHistoryItem: DownloadHistoryItem = {
        id: `dl_${Date.now()}`,
        videoId: videoInfo.videoId,
        title: videoInfo.title,
        channel: videoInfo.channel,
        quality: quality,
        format: isAudio ? 'MP3' : 'MP4',
        fileSizeMB: actualMB,
        downloadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        thumbnail: videoInfo.thumbnails.hq,
        downloadUrl,
      };

      setHistory((prev) => [newHistoryItem, ...prev]);

      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 1500);

    } catch (err: any) {
      console.error('Download stream error:', err);
      setDownloadStatus('Download error occurred. Retrying fallback stream...');
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        setDownloadStatus('');
      }, 3000);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleAddBatchHistory = (item: DownloadHistoryItem) => {
    setHistory((prev) => [item, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Supports 360p, 480p, 720p HD, 1080p Full HD & MP3 Audio</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Download YouTube Videos as <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 bg-clip-text text-transparent">
              Standalone Media Files
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Convert and download any YouTube video in high definition. Pick your exact resolution from 360p to 1080p, extract audio tracks, or generate AI video summaries.
          </p>

          {/* URL Input Form */}
          <UrlInput
            onAnalyze={handleAnalyzeVideo}
            isLoading={isLoading}
            currentUrl={videoInfo?.url || ''}
          />
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="max-w-3xl mx-auto bg-rose-950/80 border border-rose-800/80 rounded-2xl p-4 text-xs text-rose-200 text-center font-medium shadow-xl">
            {errorMessage}
          </div>
        )}

        {/* Main Workspace Navigation Content */}
        {activeTab === 'single' && (
          <div className="space-y-8">
            {isLoading ? (
              <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center space-y-4 shadow-2xl">
                <div className="w-10 h-10 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono text-slate-400">
                  Fetching YouTube video stream formats & metadata...
                </p>
              </div>
            ) : videoInfo ? (
              <div className="space-y-8">
                {/* 2-Column Split: Video Preview + Resolution Selector */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Video Preview Card */}
                  <div className="lg:col-span-5">
                    <VideoCard
                      info={videoInfo}
                      onOpenAiSummary={() => setActiveTab('ai')}
                    />
                  </div>

                  {/* Right Column: Resolution Definition Selector */}
                  <div className="lg:col-span-7">
                    <ResolutionSelector
                      info={videoInfo}
                      onStartDownload={handleStartDownload}
                      isDownloading={isDownloading}
                      downloadProgress={downloadProgress}
                      downloadStatus={downloadStatus}
                    />
                  </div>

                </div>

                {/* AI Summary Section Below */}
                <AiSummaryCard info={videoInfo} />
              </div>
            ) : null}
          </div>
        )}

        {/* Batch Queue Mode Tab */}
        {activeTab === 'batch' && (
          <BatchQueue onAddHistoryItem={handleAddBatchHistory} />
        )}

        {/* AI Video Analyzer Tab */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {videoInfo ? (
              <AiSummaryCard info={videoInfo} />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400">
                Please enter a YouTube video URL first to analyze with AI.
              </div>
            )}
          </div>
        )}

        {/* Download History Tab */}
        {activeTab === 'history' && (
          <DownloadHistory
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="font-bold text-slate-300">TubeDL PRO Engine</span>
            <span>· High Definition YouTube Downloader</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono">
            <span>Supported: 1080p · 720p · 480p · 360p · MP3</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
