import { FaTiktok } from 'react-icons/fa';
import DownloadViewLayout from '../components/shared/DownloadViewLayout';

const TikTokView = () => {
  return (
    <DownloadViewLayout
      icon={FaTiktok}
      iconClassName="text-[#69c9d0] text-2xl"
      title="Download"
      subtitle="Download videos from TikTok."
      placeholder="https://www.tiktok.com/@user/video/..."
      fetchIpcChannel="get-tiktok-info"
      downloadIpcChannel="download-tiktok-media"
      urlValidationRegex={
        /^https?:\/\/(www\.)?(tiktok\.com\/.+|vm\.tiktok\.com\/.+)/i
      }
      urlValidationError="This link doesn't appear to be from TikTok. If you're unsure, please use the 'Other' category."
      mediaListTitle="Media in Post"
    />
  );
};

export default TikTokView;
