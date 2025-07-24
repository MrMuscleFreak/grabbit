import DownloadPathSetting from '../components/settings/DownloadPathSetting';
import DropdownSetting from '../components/settings/DropdownSetting';
import SettingsSection from '../components/settings/SettingsSection';
import ToggleSetting from '../components/settings/ToggleSetting';

const SettingsView = () => {
  return (
    <div className=" w-2xl p-8 text-white h-full overflow-y-auto">
      <div className="mx-auto space-y-10">
        <SettingsSection title="File Management">
          <DownloadPathSetting />
          <ToggleSetting
            settingKey="overwriteFiles"
            label="Overwrite Existing Files"
            description="If disabled, new files will be renamed (e.g., 'video (1).mp4')."
          />
          <ToggleSetting
            settingKey="smartRename"
            label="Smart Rename Downloads"
            description="If enabled, files will be renamed intelligently (e.g., 'video (1).mp4')."
          />
        </SettingsSection>

        <SettingsSection title="Media & Formats">
          <DropdownSetting
            settingKey="defaultVideoFormat"
            label="Default Video Format"
            options={[
              { label: 'MP4', value: 'mp4' },
              { label: 'MKV', value: 'mkv' },
              { label: 'WebM', value: 'webm' },
            ]}
          />
          <DropdownSetting
            settingKey="defaultAudioFormat"
            label="Default Audio Format"
            options={[
              { label: 'MP3', value: 'mp3' },
              { label: 'M4A', value: 'm4a' },
              { label: 'FLAC', value: 'flac' },
              { label: 'Opus', value: 'opus' },
            ]}
          />
          <ToggleSetting
            settingKey="embedThumbnails"
            label="Embed Thumbnail in Audio"
            description="Saves the video thumbnail as the cover art for audio files."
          />
          <ToggleSetting
            settingKey="embedMetadata"
            label="Embed Metadata"
            description="Includes media metadata in the downloaded media file."
          />
        </SettingsSection>

        {/* TODO: New settings options
                  - File naming convention
                  - Overwrite files ✅
                  - Default media format
                  - Default audio format
                  - auto embed thumbnails ✅
                  - auto embed metadata ✅
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
