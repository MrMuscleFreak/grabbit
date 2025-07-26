import { FaDownload, FaMusic, FaVideo } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { useState } from 'react';
import ThumbnailDownloadButton from './ThumbnailDownloadButton';

type VideoDetails = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
};

type VideoDetailsCardProps = {
  details: VideoDetails;
  onDownload: (quality: string, format: 'mp4' | 'mp3') => void;
  downloadStatus: 'idle' | 'downloading' | 'completed' | 'failed';
  downloadProgress: number;
  isListItem?: boolean;
};

const VideoDetailsCard = ({
  details,
  onDownload,
  isListItem = false,
  downloadStatus,
  downloadProgress,
}: VideoDetailsCardProps) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState(
    'bestvideo+bestaudio/best'
  );
  const videoQualities = [
    { label: 'Best Quality', value: 'bestvideo+bestaudio/best' },
    { label: '1080p', value: 'bestvideo[height<=1080]+bestaudio/best' },
    { label: '720p', value: 'bestvideo[height<=720]+bestaudio/best' },
  ];

  const audioQualities = [
    { label: 'Best Quality', value: 'bestaudio/best' },
    { label: 'Medium (128k)', value: 'bestaudio[abr<=128]/best' },
  ];

  const currentQualities =
    activeTab === 'video' ? videoQualities : audioQualities;

  const handleDownloadClick = () => {
    const format: 'mp4' | 'mp3' = activeTab === 'video' ? 'mp4' : 'mp3';
    onDownload(selectedQuality, format);
  };

  const handleThumbnailDownload = () => {
    window.ipcRenderer.send('download-thumbnail', {
      thumbnailUrl: details.thumbnail,
      title: details.title,
    });
  };

  if (isListItem) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full max-w-2xl flex items-center gap-4 p-3 bg-slate-800/70 border border-slate-700 rounded-xl"
      >
        <div className="relative flex-shrink-0">
          <img
            src={details.thumbnail}
            alt={details.title}
            className="w-32 h-20 object-cover rounded-lg"
          />
          <ThumbnailDownloadButton
            onDownload={handleThumbnailDownload}
            size="small"
          />
          {downloadStatus === 'downloading' && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
              <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {downloadStatus === 'completed' && (
            <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center rounded-lg">
              <FaDownload className="text-white text-2xl" />
            </div>
          )}
        </div>
        <div className="flex-grow overflow-hidden">
          <h3
            className="text-white font-semibold truncate"
            title={details.title}
          >
            {details.title}
          </h3>
          <p className="text-slate-400 text-sm truncate">{details.channel}</p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-4 pr-5">
          <button
            onClick={() => onDownload('bestvideo+bestaudio/best', 'mp4')}
            disabled={downloadStatus !== 'idle'}
            className="text-purple-400 hover:text-purple-300 disabled:text-slate-600 transition-colors"
            title="Download as MP4"
          >
            <FaVideo className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDownload('bestaudio/best', 'mp3')}
            disabled={downloadStatus !== 'idle'}
            className="text-purple-400 hover:text-purple-300 disabled:text-slate-600 transition-colors"
            title="Download as MP3"
          >
            <FaMusic className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 1 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-8 w-full max-w-2xl bg-slate-800/70 border border-slate-700 rounded-2xl shadow-2xl flex flex-col"
    >
      <div className="flex gap-8 p-5">
        {/* Left Column */}
        <div className="w-3/5 flex-shrink-0 relative">
          <img
            src={details.thumbnail}
            alt="Video Thumbnail"
            className="w-full h-auto rounded-xl object-cover shadow-lg"
          />
          <ThumbnailDownloadButton onDownload={handleThumbnailDownload} />
          <h2 className="text-xl font-bold text-white mt-4 leading-tight">
            {details.title}
          </h2>
          <p className="text-slate-400 text-sm mt-1">{details.channel}</p>
        </div>

        {/* Right Column */}
        <div className="w-2/5 flex flex-col">
          <div className="flex border-b border-slate-600 mb-4">
            <button
              onClick={() => {
                setActiveTab('video');
                setSelectedQuality(videoQualities[0].value);
              }}
              className={`flex-1 py-2 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'video'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaVideo />
              Video
            </button>
            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedQuality(audioQualities[0].value);
              }}
              className={`flex-1 py-2 font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'audio'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FaMusic />
              Audio
            </button>
          </div>

          {/* Quality Options */}
          <div className="flex-grow space-y-3">
            {activeTab === 'video' ? (
              <>
                <button
                  onClick={() => setSelectedQuality(videoQualities[0].value)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedQuality === videoQualities[0].value
                      ? 'bg-purple-600/30 text-purple-300 font-bold'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {videoQualities[0].label}
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedQuality(videoQualities[1].value)}
                    className={`w-1/2 text-center p-3 rounded-lg transition-colors ${
                      selectedQuality === videoQualities[1].value
                        ? 'bg-purple-600/30 text-purple-300 font-bold'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {videoQualities[1].label}
                  </button>
                  <button
                    onClick={() => setSelectedQuality(videoQualities[2].value)}
                    className={`w-1/2 text-center p-3 rounded-lg transition-colors ${
                      selectedQuality === videoQualities[2].value
                        ? 'bg-purple-600/30 text-purple-300 font-bold'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    {videoQualities[2].label}
                  </button>
                </div>
              </>
            ) : (
              // Fallback for Audio tab
              currentQualities.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedQuality(option.value)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedQuality === option.value
                      ? 'bg-purple-600/30 text-purple-300 font-bold'
                      : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Download Status Bar */}
      <div className="w-full mt-auto">
        {downloadStatus === 'downloading' && (
          <div className="relative w-full h-12 bg-slate-700 rounded-xl">
            <motion.div
              className="absolute top-0 left-0 h-full bg-purple-600 rounded-2xl"
              initial={{ width: 0 }}
              animate={{ width: `${downloadProgress}%` }}
              transition={{ duration: 0.1 }}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold rounded-2xl">
              Downloading... {downloadProgress.toFixed(0)}%
            </div>
          </div>
        )}
        {downloadStatus === 'completed' && (
          <div className="relative w-full h-12 bg-green-600 flex items-center justify-center text-white font-bold">
            Download Complete
          </div>
        )}
        {(downloadStatus === 'idle' || downloadStatus === 'failed') && (
          <button
            onClick={handleDownloadClick}
            className="w-full h-12 bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg rounded-xl"
          >
            <FaDownload />
            {downloadStatus === 'failed' ? 'Try Again' : 'Download'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default VideoDetailsCard;
