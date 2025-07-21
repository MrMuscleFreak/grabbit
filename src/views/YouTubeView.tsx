import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaYoutube } from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState('best');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
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

  const handleDownload = () => {
    console.log(`Downloading ${activeTab} (${selectedQuality}) from ${url}`);
    alert('Download started! (See console for details)');
  };

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
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeView;
