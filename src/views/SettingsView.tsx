import DownloadPathSetting from '../components/settings/DownloadPathSetting';
import ToggleSetting from '../components/settings/ToggleSetting';

const SettingsView = () => {
  return (
    <div className="p-8 text-white h-full">
      <div className="space-y-8 w-xl mx-auto">
        <DownloadPathSetting />
        <ToggleSetting
          settingKey="overwriteFiles"
          label="Overwrite Existing Files"
          description="If disabled, new files will be renamed (e.g., 'video (1).mp4')."
        />
        <ToggleSetting
          settingKey="embedThumbnails"
          label="Embed Thumbnail in Audio"
          description="Saves the video thumbnail as the cover art for audio files."
        />

        {/* TODO: New settings options
                  - File naming convention
                  - Overwrite files ✅
                  - Default media format
                  - Default audio format
                  - auto embed thumbnails ✅
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
