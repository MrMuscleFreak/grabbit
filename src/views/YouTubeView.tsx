import { useEffect, useState } from 'react';
import { FaYoutube } from 'react-icons/fa';
import { IpcRendererEvent } from 'electron';
import DownloadViewLayout from '../components/shared/DownloadViewLayout';
import VideoDetailsCard from '../components/youtube/VideoDetailsCard';
import PlaylistHeader from '../components/youtube/PlaylistHeader';

type VideoDetails = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
};

const YouTubeView = () => {
  const [url, setUrl] = useState('');
  const [videos, setVideos] = useState<VideoDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadQueue, setDownloadQueue] = useState<VideoDetails[]>([]);
  const [batchDownloadConfig, setBatchDownloadConfig] = useState<{
    quality: string;
    format: 'mp4' | 'mp3';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    //  validate the YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(url)) {
      alert(
        'This link doesn’t appear to be from YouTube. If you\'re unsure about its source, please paste it under the "Others" category.'
      );
      return; // URL is not valid (yt)
    }

    setIsLoading(true);
    setVideos([]); // Clear previous videos
    setPlaylistTitle(null);
    const result = await window.ipcRenderer.invoke('get-video-info', url);
    if (result.success) {
      setVideos(result.videos);
      setPlaylistTitle(result.playlistTitle);
    } else {
      alert(`Error: ${result.error}`);
    }
    setIsLoading(false);
  };

  const handleDownload = async (
    videoUrl: string,
    videoId: string,
    quality: string,
    format: 'mp4' | 'mp3'
  ) => {
    if (downloadingId || downloadQueue.length > 0) {
      alert('A download is already in progress.');
      return;
    }
    setDownloadingId(videoId);
    setDownloadProgress(0);

    window.ipcRenderer.send('download-youtube-media', {
      url: videoUrl,
      quality: quality,
      format: format,
    });
  };

  const handleDownloadAll = (quality: string, format: 'mp4' | 'mp3') => {
    if (downloadingId || downloadQueue.length > 0) {
      alert('A download is already in progress.');
      return;
    }
    setDownloadQueue([...videos]);
    setBatchDownloadConfig({ quality, format });
  };

  useEffect(() => {
    // This effect triggers the next download in the queue
    if (downloadQueue.length > 0 && !downloadingId && batchDownloadConfig) {
      const nextVideo = downloadQueue[0];
      setDownloadingId(nextVideo.id);
      setDownloadProgress(0);
      window.ipcRenderer.send('download-youtube-media', {
        url: nextVideo.url,
        quality: batchDownloadConfig.quality,
        format: batchDownloadConfig.format,
      });
    }
  }, [downloadQueue, downloadingId, batchDownloadConfig]);

  useEffect(() => {
    // Listener for progress updates
    const handleProgress = (
      _event: IpcRendererEvent,
      { progress }: { progress: number }
    ) => {
      setDownloadProgress((prevProgress) =>
        progress > prevProgress ? progress : prevProgress
      );
    };

    // Listener for completion
    const handleComplete = (
      _event: IpcRendererEvent,
      { success, error }: { success: boolean; error?: string }
    ) => {
      if (!success) {
        alert(`Download failed: ${error}`);
      }

      // If we are in a batch download, process the queue
      if (batchDownloadConfig) {
        const newQueue = downloadQueue.slice(1);
        setDownloadQueue(newQueue);
        if (newQueue.length === 0) {
          setBatchDownloadConfig(null); // Batch is done
        }
      }

      setDownloadingId(null); // Free up for the next download
    };

    window.ipcRenderer.on('download-progress', handleProgress);
    window.ipcRenderer.on('download-complete', handleComplete);

    return () => {
      window.ipcRenderer.off('download-progress', handleProgress);
      window.ipcRenderer.off('download-complete', handleComplete);
    };
  }, [downloadQueue, batchDownloadConfig]);

  return (
    <DownloadViewLayout
      icon={FaYoutube}
      iconClassName="text-red-600"
      title="Download"
      subtitle="Download videos, shorts, and playlists from YouTube."
      url={url}
      setUrl={setUrl}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      showInitialContent={videos.length === 0}
      placeholder="https://www.youtube.com/watch?v=..."
    >
      {/* The children prop now contains only the YouTube-specific results */}
      {playlistTitle && (
        <PlaylistHeader
          playlistTitle={playlistTitle}
          videoCount={videos.length}
          thumbnailUrl={videos[0]?.thumbnail}
          onDownloadAll={handleDownloadAll}
          isDownloading={!!batchDownloadConfig || !!downloadingId}
        />
      )}

      {playlistTitle && (
        <div className="w-full max-w-2xl px-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Videos in Playlist
          </p>
        </div>
      )}

      {videos.map((video) => (
        <VideoDetailsCard
          key={video.id}
          details={video}
          isListItem={playlistTitle !== null}
          onDownload={(quality, format) =>
            handleDownload(video.url, video.id, quality, format)
          }
          downloadStatus={downloadingId === video.id ? 'downloading' : 'idle'}
          downloadProgress={downloadingId === video.id ? downloadProgress : 0}
        />
      ))}
    </DownloadViewLayout>
  );
};

export default YouTubeView;
