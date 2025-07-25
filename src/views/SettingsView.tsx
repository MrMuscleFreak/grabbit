import DownloadPathSetting from '../components/settings/DownloadPathSetting';
import DropdownSetting from '../components/settings/DropdownSetting';
import FileNameSetting from '../components/settings/FileNameSetting';
import SettingsSection from '../components/settings/SettingsSection';
import ShowLogFiles from '../components/settings/ShowLogFiles';
import TextAreaSetting from '../components/settings/TextAreaSettings';
import ToggleSetting from '../components/settings/ToggleSetting';
import VersionInfo from '../components/settings/VersionInfo';

const SettingsView = () => {
  return (
    <div className=" w-2xl p-4 py-10 text-white h-full overflow-y-auto">
      <div className="mx-auto space-y-10">
        <SettingsSection title="File Management">
          <DownloadPathSetting />
          <FileNameSetting />
          <ToggleSetting
            settingKey="overwriteFiles"
            label="Overwrite Existing Files"
            description="If disabled, new files will be renamed (e.g., 'video (1).mp4')."
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
          <DropdownSetting
            settingKey="defaultImageFormat"
            label="Default Image Format"
            options={[
              { label: 'JPEG', value: 'jpg' },
              { label: 'PNG', value: 'png' },
              { label: 'WebP', value: 'webp' },
              { label: 'AVIF', value: 'avif' },
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
          <DropdownSetting
            settingKey="frameratePreference"
            label="Framerate Preference"
            description="Choose the preferred framerate for video downloads."
            options={[
              { label: 'Auto', value: 'auto' },
              { label: '25 FPS', value: '25' },
              { label: '30 FPS', value: '30' },
              { label: '60 FPS', value: '60' },
            ]}
          />
        </SettingsSection>
        <SettingsSection
          title="Advanced"
          warning="If you don't understand what you're doing here, you are better off not touching these settings."
        >
          <ToggleSetting
            settingKey="debugMode"
            label="Debug Mode"
            description="Enables verbose logging and additional debug features saved in the log files."
          />
          <ToggleSetting
            settingKey="enableVerboseLogging"
            label="Enable Verbose yt-dlp Logging"
            description="Enables verbose logging for yt-dlp."
          />
          <TextAreaSetting
            settingKey="customYtdlpArgs"
            label="Custom yt-dlp Args"
            description="Additional arguments to pass to yt-dlp. Separate multiple arguments with spaces."
          />
          <ShowLogFiles />
        </SettingsSection>

        <VersionInfo appName="Grabbit" />

        {/* TODO: New settings options
                  - Multiple downloads at once selector
                  - smart rename downloads ???
                  - auto check for updates
        */}
      </div>
    </div>
  );
};

export default SettingsView;
