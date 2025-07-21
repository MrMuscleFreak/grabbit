import DownloadPathSetting from '../components/settings/DownloadPathSetting';

const SettingsView = () => {
  return (
    <div className="p-8 text-white h-full">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-8 max-w-xl">
        <DownloadPathSetting />
      </div>
    </div>
  );
};

export default SettingsView;
