import { useState, useEffect } from 'react';

const SettingsView = () => {
  const [downloadPath, setDownloadPath] = useState('');

  // On load
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await window.ipcRenderer.invoke('get-settings');
      if (settings.downloadPath) {
        setDownloadPath(settings.downloadPath);
      }
    };
    fetchSettings();
  }, []);

  // Handler for the "Browse" button
  const handleSelectDirectory = async () => {
    const result = await window.ipcRenderer.invoke('select-directory');
    if (result.success) {
      setDownloadPath(result.path);
    }
  };

  return (
    <div className="p-8 text-white h-full">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="space-y-6 max-w-xl">
        <div>
          <label
            htmlFor="downloadPath"
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            Default Download Path
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="downloadPath"
              value={downloadPath}
              readOnly // The user should only change this via the dialog
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md cursor-default"
            />
            <button
              onClick={handleSelectDirectory}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md font-semibold whitespace-nowrap"
            >
              Browse...
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
