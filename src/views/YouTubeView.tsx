import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube } from 'react-icons/fa';
import { IpcRendererEvent } from 'electron';
import URLForm from '../components/youtube/URLForm';
import VideoDetailsCard from '../components/youtube/VideoDetailsCard';

type VideoDetails = {
  title: string;
  channel: string;
  thumbnail: string;
};

const YouTubeView = () => {
  const [url, setUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<
    'idle' | 'downloading' | 'completed' | 'failed'
  >('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState('best');

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
    setVideoDetails(null);
    const result = await window.ipcRenderer.invoke('get-video-info', url);
    if (result.success) {
      setVideoDetails(result.details);
    } else {
      alert(`Error: ${result.error}`);
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!videoDetails) return;

    setDownloadStatus('downloading');
    setDownloadProgress(0);

    window.ipcRenderer.send('download-youtube-media', {
      url: url,
      quality: selectedQuality,
      format: activeTab === 'video' ? 'mp4' : 'mp3',
    });
  };

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
      if (success) {
        setDownloadStatus('completed');
        new Notification('Download Complete', {
          body: `Successfully downloaded "${videoDetails?.title}".`,
        });
      } else {
        setDownloadStatus('failed');
        alert(`Download failed: ${error}`);
      }
    };

    window.ipcRenderer.on('download-progress', handleProgress);
    window.ipcRenderer.on('download-complete', handleComplete);

    // Cleanup listeners when the component unmounts
    return () => {
      window.ipcRenderer.off('download-progress', handleProgress);
      window.ipcRenderer.off('download-complete', handleComplete);
    };
  }, [videoDetails]);

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
          {!videoDetails && (
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

      <AnimatePresence>
        {videoDetails && (
          <VideoDetailsCard
            details={videoDetails}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedQuality={selectedQuality}
            setSelectedQuality={setSelectedQuality}
            onDownload={handleDownload}
            downloadStatus={downloadStatus}
            downloadProgress={downloadProgress}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeView;
