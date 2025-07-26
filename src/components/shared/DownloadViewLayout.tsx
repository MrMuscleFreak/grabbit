import { motion, AnimatePresence } from 'framer-motion';
import URLForm from './URLForm';
import { IpcRendererEvent } from 'electron';
import { useEffect, useState } from 'react';
import PlaylistHeader from '../youtube/PlaylistHeader';
import VideoDetailsCard from '../youtube/VideoDetailsCard';

type MediaDetails = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
};

interface DownloadViewLayoutProps {
  // Configuration Props
  icon: React.ElementType;
  iconClassName?: string;
  title: string;
  subtitle: string;
  placeholder?: string;
  fetchIpcChannel: string;
  downloadIpcChannel: string;
  urlValidationRegex: RegExp;
  urlValidationError: string;
  mediaListTitle: string;
}

const DownloadViewLayout: React.FC<DownloadViewLayoutProps> = ({
  icon: Icon,
  iconClassName = 'text-white',
  title,
  subtitle,
  placeholder,
  fetchIpcChannel,
  downloadIpcChannel,
  urlValidationRegex,
  urlValidationError,
  mediaListTitle,
}) => {
  // All state is now managed here
  const [url, setUrl] = useState('');
  const [media, setMedia] = useState<MediaDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [collectionTitle, setCollectionTitle] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadQueue, setDownloadQueue] = useState<MediaDetails[]>([]);
  const [batchDownloadConfig, setBatchDownloadConfig] = useState<{
    quality: string;
    format: 'mp4' | 'mp3';
  } | null>(null);

  // All handlers are now here
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!urlValidationRegex.test(url)) {
      alert(urlValidationError);
      return;
    }
    setIsLoading(true);
    setMedia([]);
    setCollectionTitle(null);
    const result = await window.ipcRenderer.invoke(fetchIpcChannel, url);
    if (result.success) {
      const videos = result.videos || [];
      setMedia(videos);
      if (videos.length > 1) {
        setCollectionTitle(result.playlistTitle || result.postTitle);
      }
    } else {
      alert(`Error: ${result.error}`);
    }
    setIsLoading(false);
  };

  const handleDownload = async (
    mediaUrl: string,
    mediaId: string,
    quality: string,
    format: 'mp4' | 'mp3'
  ) => {
    if (downloadingId || downloadQueue.length > 0) {
      alert('A download is already in progress.');
      return;
    }
    setDownloadingId(mediaId);
    setDownloadProgress(0);
    window.ipcRenderer.send(downloadIpcChannel, {
      url: mediaUrl,
      quality,
      format,
    });
  };

  const handleDownloadAll = (quality: string, format: 'mp4' | 'mp3') => {
    if (downloadingId || downloadQueue.length > 0) {
      alert('A download is already in progress.');
      return;
    }
    setDownloadQueue([...media]);
    setBatchDownloadConfig({ quality, format });
  };

  // All effects are now here
  useEffect(() => {
    if (downloadQueue.length > 0 && !downloadingId && batchDownloadConfig) {
      const nextItem = downloadQueue[0];
      setDownloadingId(nextItem.id);
      setDownloadProgress(0);
      window.ipcRenderer.send(downloadIpcChannel, {
        url: nextItem.url,
        quality: batchDownloadConfig.quality,
        format: batchDownloadConfig.format,
      });
    }
  }, [downloadQueue, downloadingId, batchDownloadConfig, downloadIpcChannel]);

  useEffect(() => {
    const handleProgress = (
      _event: IpcRendererEvent,
      { progress }: { progress: number }
    ) => {
      setDownloadProgress((p) => (progress > p ? progress : p));
    };
    const handleComplete = (
      _event: IpcRendererEvent,
      { success, error }: { success: boolean; error?: string }
    ) => {
      if (!success) alert(`Download failed: ${error}`);
      if (batchDownloadConfig) {
        const newQueue = downloadQueue.slice(1);
        setDownloadQueue(newQueue);
        if (newQueue.length === 0) setBatchDownloadConfig(null);
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
    <div
      className={`w-full h-full flex flex-col items-center transition-all duration-500 overflow-y-auto ${
        media.length === 0 ? 'justify-center' : 'justify-start pt-12'
      }`}
    >
      <motion.div
        layout
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-2xl flex flex-col items-center flex-shrink-0"
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`text-6xl ${iconClassName}`} />
          <span className="text-4xl font-bold text-white">{title}</span>
        </div>
        <AnimatePresence>
          {media.length === 0 && (
            <motion.p
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400 text-center mb-6 max-w-md"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
        <URLForm
          url={url}
          setUrl={setUrl}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={placeholder}
        />
      </motion.div>

      <div className="w-full max-w-2xl mt-4 space-y-4 flex flex-col items-center">
        <AnimatePresence>
          {collectionTitle && (
            <PlaylistHeader
              playlistTitle={collectionTitle}
              videoCount={media.length}
              thumbnailUrl={media[0]?.thumbnail}
              onDownloadAll={handleDownloadAll}
              isDownloading={!!batchDownloadConfig || !!downloadingId}
            />
          )}
          {collectionTitle && (
            <div className="w-full max-w-2xl px-2 pt-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {mediaListTitle}
              </p>
            </div>
          )}
          {media.map((item) => (
            <VideoDetailsCard
              key={item.id}
              details={item}
              isListItem={collectionTitle !== null}
              onDownload={(quality, format) =>
                handleDownload(item.url, item.id, quality, format)
              }
              downloadStatus={
                downloadingId === item.id ? 'downloading' : 'idle'
              }
              downloadProgress={
                downloadingId === item.id ? downloadProgress : 0
              }
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadViewLayout;
