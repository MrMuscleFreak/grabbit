import DownloadPathSetting from '../components/settings/DownloadPathSetting';

const SettingsView = () => {
  return (
    <div className="p-8 text-white h-full">
      <div className="space-y-8 max-w-xl">
        <DownloadPathSetting />
      </div>
    </div>
  );
};

export default SettingsView;
