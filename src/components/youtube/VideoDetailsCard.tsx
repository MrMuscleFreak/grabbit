import { FaDownload } from 'react-icons/fa6';
import { motion } from 'framer-motion';

type VideoDetails = {
  title: string;
  channel: string;
  thumbnail: string;
};

type VideoDetailsCardProps = {
  details: VideoDetails;
  activeTab: 'video' | 'audio';
  setActiveTab: (tab: 'video' | 'audio') => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  onDownload: () => void;
};

const VideoDetailsCard = ({
  details,
  activeTab,
  setActiveTab,
  selectedQuality,
  setSelectedQuality,
  onDownload,
}: VideoDetailsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.98 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mt-8 w-full max-w-2xl bg-slate-800/70 border border-slate-700 rounded-2xl shadow-2xl p-5"
    >
      <div className="flex gap-8">
        {/* Left Column */}
        <div className="w-3/5 flex-shrink-0">
          <img
            src={details.thumbnail}
            alt="Video Thumbnail"
            className="w-full h-auto rounded-xl object-cover shadow-lg"
          />
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
                setSelectedQuality('best');
              }}
              className={`flex-1 py-2 text-center font-semibold transition-colors ${
                activeTab === 'video'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              onClick={() => {
                setActiveTab('audio');
                setSelectedQuality('best_audio');
              }}
              className={`flex-1 py-2 text-center font-semibold transition-colors ${
                activeTab === 'audio'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audio
            </button>
          </div>
          <div className="flex-grow space-y-3">
            {/* Quality options would go here */}
          </div>
          <button
            onClick={onDownload}
            className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg"
          >
            <FaDownload />
            Download
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoDetailsCard;
