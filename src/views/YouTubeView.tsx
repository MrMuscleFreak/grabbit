import { FaYoutube } from 'react-icons/fa';
import DownloadViewLayout from '../components/shared/DownloadViewLayout';

const YouTubeView = () => {
  return (
    <DownloadViewLayout
      icon={FaYoutube}
      iconClassName="text-red-600"
      title="Download"
      subtitle="Download videos, shorts, and playlists from YouTube."
      placeholder="https://www.youtube.com/watch?v=..."
      fetchIpcChannel="get-video-info"
      downloadIpcChannel="download-youtube-media"
      urlValidationRegex={
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
      }
      urlValidationError="This link doesn’t appear to be from YouTube. If you're unsure, please use the 'Other' category."
      mediaListTitle="Videos in Playlist"
    />
  );
};

export default YouTubeView;
