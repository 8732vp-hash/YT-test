export interface VideoResolution {
  quality: string; // '1080p' | '720p' | '480p' | '360p' | 'audio-mp3' | 'audio-m4a'
  label: string;
  height: number;
  fps: number;
  format: string; // 'MP4' | 'MP3' | 'M4A'
  codec: string;
  bitrate: string;
  estSizeMB: number;
  badge?: string;
  recommended?: boolean;
}

export interface VideoInfo {
  videoId: string;
  url: string;
  title: string;
  channel: string;
  duration: number;
  durationFormatted: string;
  views: string;
  description: string;
  thumbnails: {
    maxres: string;
    hq: string;
    mq: string;
  };
  resolutions: VideoResolution[];
}

export interface AiSummary {
  summary: string;
  keyTakeaways: string[];
  chapters: { timestamp: string; title: string }[];
  tags: string[];
  quote: string;
}

export interface DownloadHistoryItem {
  id: string;
  videoId: string;
  title: string;
  channel: string;
  quality: string;
  format: string;
  fileSizeMB: number;
  downloadedAt: string;
  thumbnail: string;
  downloadUrl: string;
}

export interface BatchItem {
  url: string;
  videoId?: string;
  valid: boolean;
  title?: string;
  channel?: string;
  durationFormatted?: string;
  thumbnail?: string;
  selectedQuality?: string;
  status?: 'idle' | 'downloading' | 'completed' | 'error';
}
