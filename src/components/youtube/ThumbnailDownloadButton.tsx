import { useState } from 'react';
import { FaDownload, FaCheck } from 'react-icons/fa6';

interface ThumbnailDownloadButtonProps {
  onDownload: () => void;
  size?: 'small' | 'large';
}

const ThumbnailDownloadButton: React.FC<ThumbnailDownloadButtonProps> = ({
  onDownload,
  size = 'large',
}) => {
  const [isDownloaded, setIsDownloaded] = useState(false);

  const handleClick = () => {
    if (isDownloaded) return;
    onDownload();
    setIsDownloaded(true);
  };

  const buttonClasses = size === 'large' ? 'p-2' : 'p-1.5';
  const iconClasses = size === 'large' ? 'w-4 h-4' : 'w-3 h-3';

  if (isDownloaded) {
    return (
      <div className="absolute top-2 left-2 z-10 group">
        <div
          className={`flex items-center justify-center rounded-full bg-green-600 text-white ${buttonClasses}`}
        >
          <FaCheck className={iconClasses} />
        </div>
        <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Downloaded
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      title="Download thumbnail"
      className={`absolute top-2 left-2 z-10 flex items-center justify-center rounded-full bg-slate-900/70 text-white hover:!bg-purple-600 transition-all group ${buttonClasses}`}
    >
      <FaDownload className={iconClasses} />
      <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 px-2 py-1 bg-slate-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        Download Thumbnail
      </span>
    </button>
  );
};

export default ThumbnailDownloadButton;
