import { FaInstagram } from 'react-icons/fa';
import DownloadViewLayout from '../components/shared/DownloadViewLayout';

const InstagramView = () => {
  return (
    <DownloadViewLayout
      icon={FaInstagram}
      iconClassName="text-[#dd2a7b]"
      title="Download"
      subtitle="Download videos, reels, and posts from Instagram."
      placeholder="https://www.instagram.com/p/..."
      fetchIpcChannel="get-instagram-info"
      downloadIpcChannel="download-instagram-media"
      urlValidationRegex={
        /^(https?:\/\/)?(www\.)?instagram\.com\/(p|reel|reels|tv)\/.+$/
      }
      urlValidationError="This link doesn't appear to be from Instagram. If you're unsure, please use the 'Other' category."
      mediaListTitle="Media in Post"
    />
  );
};

export default InstagramView;
