import DownloadPathSetting from '../components/settings/DownloadPathSetting';

const SettingsView = () => {
  return (
    <div className="p-8 text-white h-full">
      <div className="space-y-8 max-w-xl">
        <DownloadPathSetting />

        {/* TODO: New settings options
                  - File naming convention
                  - Overwrite files
                  - Default media format
                  - Default audio format
                  - auto embed thumbnails
                  - auto embed metadata
                  - frame rate preference
                  - smart rename downloads
                  - auto check for updates
                  ADVANCED
                  - Debug mode
                  - Enable Verbose yt-dlp Logging
                  - Custom yt-dlp Args
                  -
        */}
      </div>
    </div>
  );
};

export default SettingsView;
