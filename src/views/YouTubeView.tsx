import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowRight, FaDownload } from 'react-icons/fa6';
import { FaYoutube } from 'react-icons/fa';

// Mock data for demonstration purposes
const mockVideoDetails = {
  thumbnail: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', // Placeholder image
  title: 'Never Gonna Give You Up',
  channel: 'Rick Astley',
};

const YouTubeView = () => {
  const [url, setUrl] = useState('');
  const [videoDetails, setVideoDetails] = useState<
    typeof mockVideoDetails | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState('best');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    // Simulate fetching video data
    setTimeout(() => {
      setVideoDetails(mockVideoDetails);
      setIsLoading(false);
    }, 1500);
  };

  const handleDownload = () => {
    // This is where you would trigger the actual download logic
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
              Download videos, shorts, and playlists from YouTube by pasting the
              link below and selecting your desired format.
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="w-full relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full p-3 pr-12 text-lg bg-slate-700/50 text-white placeholder-slate-500 rounded-2xl border-2 border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaArrowRight />
            )}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {videoDetails && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="mt-8 w-full max-w-2xl bg-slate-800/70 border border-slate-700 rounded-2xl shadow-2xl p-5"
          >
            <div className="flex gap-8">
              {/* Left Column Thumbnail and Info */}
              <div className="w-3/5 flex-shrink-0">
                <img
                  src={videoDetails.thumbnail}
                  alt="Video Thumbnail"
                  className="w-full h-auto rounded-xl object-cover shadow-lg"
                />
                <h2 className="text-xl font-bold text-white mt-4 leading-tight">
                  {videoDetails.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {videoDetails.channel}
                </p>
              </div>

              {/* Right Column: Download Options */}
              <div className="w-2/5 flex flex-col">
                <div className="flex border-b border-slate-600 mb-4">
                  <button
                    onClick={() => {
                      setActiveTab('video');
                      setSelectedQuality('best'); // Set default for video
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
                      setSelectedQuality('best_audio'); // Set default for audio
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

                {/* Quality Options */}
                <div className="flex-grow space-y-3">
                  {activeTab === 'video' && (
                    <>
                      <button
                        onClick={() => setSelectedQuality('best')}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedQuality === 'best'
                            ? 'bg-purple-600/30 text-purple-300 font-bold'
                            : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        Best Quality
                      </button>
                      <button
                        onClick={() => setSelectedQuality('1080p')}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedQuality === '1080p'
                            ? 'bg-purple-600/30 text-purple-300 font-bold'
                            : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        1080p
                      </button>
                    </>
                  )}
                  {activeTab === 'audio' && (
                    <button
                      onClick={() => setSelectedQuality('best_audio')}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedQuality === 'best_audio'
                          ? 'bg-purple-600/30 text-purple-300 font-bold'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      Best Quality
                    </button>
                  )}
                </div>

                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  className="w-full mt-6 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg"
                >
                  <FaDownload />
                  Download
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YouTubeView;
