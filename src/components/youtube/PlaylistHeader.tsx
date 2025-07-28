import { useState } from 'react';
import { FaDownload, FaMusic, FaVideo } from 'react-icons/fa6';

type PlaylistHeaderProps = {
  playlistTitle: string;
  videoCount: number;
  thumbnailUrl?: string;
  onDownloadAll: (quality: string, format: 'mp4' | 'mp3') => void;
  isDownloading: boolean;
};

const PlaylistHeader = ({
  playlistTitle,
  videoCount,
  thumbnailUrl,
  onDownloadAll,
  isDownloading,
}: PlaylistHeaderProps) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [selectedQuality, setSelectedQuality] = useState(
    'bestvideo+bestaudio/best'
  );

  const videoQualities = [
    { label: 'Best', value: 'bestvideo+bestaudio/best' },
    { label: '1080p', value: 'bestvideo[height<=1080]+bestaudio/best' },
    { label: '720p', value: 'bestvideo[height<=720]+bestaudio/best' },
  ];

  const audioQualities = [
    { label: 'Best', value: 'bestaudio/best' },
    { label: '128k', value: 'bestaudio[abr<=128]/best' },
  ];

  const handleDownloadClick = () => {
    const format = activeTab === 'video' ? 'mp4' : 'mp3';
    onDownloadAll(selectedQuality, format);
  };

  const handleThumbnailDownload = () => {
    if (!thumbnailUrl) return;
    window.ipcRenderer.send('download-thumbnail', {
      thumbnailUrl: thumbnailUrl,
      title: playlistTitle,
    });
  };

  const currentQualities =
    activeTab === 'video' ? videoQualities : audioQualities;

  return (
    <div className="w-full max-w-2xl bg-slate-800/70 border border-slate-700 rounded-xl mb-4 flex flex-col">
      <div className="p-4 flex gap-4">
        {/* Left Column: Thumbnail */}
        {thumbnailUrl && (
          <div className="w-1/3 flex-shrink-0 relative group">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <img
                src={thumbnailUrl}
                alt={`${playlistTitle} thumbnail`}
                className="w-full h-full object-contain shadow-lg"
              />
            </div>
            <button
              onClick={handleThumbnailDownload}
              className="absolute top-2 left-2 z-10 p-2 bg-slate-900/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-600"
              title="Download thumbnail"
            >
              <FaDownload className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Right Column: Controls */}
        <div className="w-2/3 flex flex-col gap-4">
          <div>
            <h2
              className="text-lg font-bold text-white truncate"
              title={playlistTitle}
            >
              {playlistTitle}
            </h2>
            <p className="text-sm text-slate-400">{videoCount} videos</p>
          </div>

          <div className="flex gap-4">
            <div className="w-1/3 flex flex-col border-r border-slate-700 pr-4">
              <button
                onClick={() => {
                  setActiveTab('video');
                  setSelectedQuality(videoQualities[0].value);
                }}
                disabled={isDownloading}
                className={`w-full py-2 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'video'
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FaVideo /> Video
              </button>
              <button
                onClick={() => {
                  setActiveTab('audio');
                  setSelectedQuality(audioQualities[0].value);
                }}
                disabled={isDownloading}
                className={`w-full py-2 font-semibold transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'audio'
                    ? 'text-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FaMusic /> Audio
              </button>
            </div>

            <div className="w-2/3 flex-grow">
              <div className="space-y-2">
                {activeTab === 'video' ? (
                  <>
                    <button
                      onClick={() =>
                        setSelectedQuality(videoQualities[0].value)
                      }
                      disabled={isDownloading}
                      className={`w-full text-left p-2 rounded-lg transition-colors text-sm disabled:text-slate-500 ${
                        selectedQuality === videoQualities[0].value
                          ? 'bg-purple-600/30 text-purple-300 font-bold'
                          : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {videoQualities[0].label}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedQuality(videoQualities[1].value)
                        }
                        disabled={isDownloading}
                        className={`w-1/2 text-center p-2 rounded-lg transition-colors text-sm disabled:text-slate-500 ${
                          selectedQuality === videoQualities[1].value
                            ? 'bg-purple-600/30 text-purple-300 font-bold'
                            : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {videoQualities[1].label}
                      </button>
                      <button
                        onClick={() =>
                          setSelectedQuality(videoQualities[2].value)
                        }
                        disabled={isDownloading}
                        className={`w-1/2 text-center p-2 rounded-lg transition-colors text-sm disabled:text-slate-500 ${
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
                  currentQualities.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedQuality(option.value)}
                      disabled={isDownloading}
                      className={`w-full text-left p-2 rounded-lg transition-colors text-sm disabled:text-slate-500 ${
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
        </div>
      </div>

      {/* Download Button Bar */}
      <div className="w-full mt-auto">
        {isDownloading ? (
          <div className="relative w-full h-10 bg-slate-700 flex items-center justify-center text-white font-bold rounded-b-xl">
            Downloading Playlist...
          </div>
        ) : (
          <button
            onClick={handleDownloadClick}
            className="w-full h-10 bg-green-600 text-white font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-lg rounded-b-xl"
          >
            <FaDownload />
            Download All
          </button>
        )}
      </div>
    </div>
  );
};

export default PlaylistHeader;
