import { useState, useEffect } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';

type TextAreaSettingProps = {
  settingKey: string;
  label: string;
  description?: string;
  placeholder?: string;
};

const TextAreaSetting = ({
  settingKey,
  label,
  description,
  placeholder,
}: TextAreaSettingProps) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const fetchInitialState = async () => {
      const settings = await window.ipcRenderer.invoke('get-settings');
      if (settings && typeof settings[settingKey] === 'string') {
        setValue(settings[settingKey]);
      }
    };
    fetchInitialState();
  }, [settingKey]);

  const handleBlur = async (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    await window.ipcRenderer.invoke('set-setting', {
      key: settingKey,
      value: newValue,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-base font-medium text-slate-300">{label}</h3>
        {description && (
          <div className="relative flex items-center group">
            <IoIosInformationCircleOutline className="text-slate-300 text-2xl" />
            <div className="absolute bottom-full right-0 z-10 mb-2 w-64 p-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {description}
            </div>
          </div>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        rows={1}
        className="w-full p-2 bg-slate-700/80 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-y h-min-2xl"
      />
    </div>
  );
};

export default TextAreaSetting;
