import { useEffect, useState } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { IpcRendererEvent } from 'electron';
import DownloadViewLayout from '../components/shared/DownloadViewLayout';
import VideoDetailsCard from '../components/youtube/VideoDetailsCard';
import PlaylistHeader from '../components/youtube/PlaylistHeader';

type MediaDetails = {
  id: string;
  title: string;
  channel: string; // For Instagram, this would be the username
  thumbnail: string;
  url: string;
};

const InstagramView = () => {
  const [url, setUrl] = useState('');
  const [videos, setVideos] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [postTitle, setPostTitle] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadQueue, setDownloadQueue] = useState<MediaDetails[]>([]);
  const [batchDownloadConfig, setBatchDownloadConfig] = useState<{
    quality: string;
    format: 'mp4' | 'mp3';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const instagramRegex =
      /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|tv)\/.+/;
    if (!instagramRegex.test(url)) {
      alert(
        'This link doesn’t appear to be from Instagram. If you\'re unsure, please use the "Other" category.'
      );
      return;
    }

    setIsLoading(true);
    setVideos([]);
    setPostTitle(null);
    // TODO: Implement the IPC call to fetch Instagram media info
    const result = await window.ipcRenderer.invoke('get-instagram-info', url);
    if (result.success) {
      setVideos(result.videos);
      setPostTitle(result.postTitle);
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

    // TODO: Implement the IPC call to download the media
    // This should be similar to the YouTube download logic.
    window.ipcRenderer.send('download-instagram-media', {
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

  // Effect for handling the download queue
  useEffect(() => {
    if (downloadQueue.length > 0 && !downloadingId && batchDownloadConfig) {
      const nextItem = downloadQueue[0];
      setDownloadingId(nextItem.id);
      setDownloadProgress(0);
      window.ipcRenderer.send('download-youtube-media', {
        url: nextItem.url,
        quality: batchDownloadConfig.quality,
        format: batchDownloadConfig.format,
      });
    }
  }, [downloadQueue, downloadingId, batchDownloadConfig]);

  // Effect for IPC listeners (progress and completion)
  useEffect(() => {
    const handleProgress = (
      _event: IpcRendererEvent,
      { progress }: { progress: number }
    ) => {
      setDownloadProgress((prevProgress) =>
        progress > prevProgress ? progress : prevProgress
      );
    };

    const handleComplete = (
      _event: IpcRendererEvent,
      { success, error }: { success: boolean; error?: string }
    ) => {
      if (!success) {
        alert(`Download failed: ${error}`);
      }

      if (batchDownloadConfig) {
        const newQueue = downloadQueue.slice(1);
        setDownloadQueue(newQueue);
        if (newQueue.length === 0) {
          setBatchDownloadConfig(null);
        }
      }
      setDownloadingId(null);
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
      icon={FaInstagram}
      iconClassName="text-[#dd2a7b]"
      title="Download"
      subtitle="Download videos, reels, and posts from Instagram."
      url={url}
      setUrl={setUrl}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      showInitialContent={videos.length === 0}
      placeholder="https://www.instagram.com/p/..."
    >
      {postTitle && (
        <PlaylistHeader
          playlistTitle={postTitle}
          videoCount={videos.length}
          thumbnailUrl={videos[0]?.thumbnail}
          onDownloadAll={handleDownloadAll}
          isDownloading={!!batchDownloadConfig || !!downloadingId}
        />
      )}

      {postTitle && (
        <div className="w-full max-w-2xl px-2 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Media in Post
          </p>
        </div>
      )}

      {videos.map((video) => (
        <VideoDetailsCard
          key={video.id}
          details={video}
          isListItem={postTitle !== null}
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

export default InstagramView;
