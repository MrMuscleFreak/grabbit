import { useState, useEffect } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
type ToggleSettingProps = {
  settingKey: string;
  label: string;
  description: string;
};

const ToggleSetting = ({
  settingKey,
  label,
  description,
}: ToggleSettingProps) => {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const fetchInitialState = async () => {
      const settings = await window.ipcRenderer.invoke('get-settings');
      if (settings && typeof settings[settingKey] === 'boolean') {
        setIsEnabled(settings[settingKey]);
      }
    };
    fetchInitialState();
  }, [settingKey]);

  const handleToggle = async () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    await window.ipcRenderer.invoke('set-setting', {
      key: settingKey,
      value: newValue,
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-base font-medium text-slate-300">{label}</h3>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleToggle}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 ${
            isEnabled ? 'bg-purple-600' : 'bg-slate-600'
          }`}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${
              isEnabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div className="relative flex items-center group">
          <IoIosInformationCircleOutline className="text-slate-300 text-2xl" />
          <div className="absolute bottom-full right-0 z-10 mb-2 w-60 p-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToggleSetting;
