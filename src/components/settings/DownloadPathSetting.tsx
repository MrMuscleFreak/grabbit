import { useState, useEffect } from 'react';
import { FaFolderOpen } from 'react-icons/fa6';

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
      {/* Use a relative container to position the button inside the input */}
      <div className="relative">
        <input
          type="text"
          id="downloadPath"
          value={downloadPath}
          readOnly
          // Add right padding for the button and change text color
          className="w-full py-2 pl-3 pr-10 bg-slate-800 border border-slate-600 rounded-md cursor-default text-slate-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
        <button
          onClick={handleSelectDirectory}
          // Position the button absolutely within the relative container
          className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white transition-colors"
        >
          <FaFolderOpen />
        </button>
      </div>
    </div>
  );
};

export default DownloadPathSetting;
