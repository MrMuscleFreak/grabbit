import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube } from 'react-icons/fa';
import { IpcRendererEvent } from 'electron';
import URLForm from '../components/youtube/URLForm';
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
    <div className="w-full h-full flex flex-col items-center justify-center transition-all duration-500">
      <motion.div
        layout
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-2xl flex flex-col items-center"
      >
        <div className="flex items-center gap-2 mb-3">
          <FaYoutube className="text-6xl text-red-600" />
          <span className="text-4xl font-bold text-white">Download</span>
        </div>

        <AnimatePresence>
          {!VideoDetailsCard && (
            <motion.p
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400 text-center mb-6 max-w-md"
            >
              Download videos, shorts, and playlists from YouTube.
            </motion.p>
          )}
        </AnimatePresence>

        <URLForm
          url={url}
          setUrl={setUrl}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </motion.div>

      <div className="w-full max-w-3xl mt-4 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] flex flex-col items-center">
        <AnimatePresence>
          {videos.length > 1 && (
            <PlaylistHeader
              playlistTitle={playlistTitle ?? 'Playlist'}
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
              isListItem={videos.length > 1}
              onDownload={(quality, format) =>
                handleDownload(video.url, video.id, quality, format)
              }
              downloadStatus={
                downloadingId === video.id ? 'downloading' : 'idle'
              }
              downloadProgress={
                downloadingId === video.id ? downloadProgress : 0
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default YouTubeView;
