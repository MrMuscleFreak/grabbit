import { useState, useEffect } from 'react';

const DownloadPathSetting = () => {
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
          readOnly
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
  );
};

export default DownloadPathSetting;