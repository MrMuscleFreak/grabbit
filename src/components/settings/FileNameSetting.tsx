import { useState, useEffect, useRef } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const presetOptions = [
  { label: 'Title', value: '%(title)s.%(ext)s' },
  { label: 'Channel - Title', value: '%(uploader)s - %(title)s.%(ext)s' },
  {
    label: 'Playlist & Index - Title',
    value: '%(playlist_title)s/%(playlist_index)s - %(title)s.%(ext)s',
  },
  { label: 'Date - Title', value: '%(upload_date)s - %(title)s.%(ext)s' },
  { label: 'Custom', value: 'custom' },
];

const FileNameSetting = () => {
  const settingKey = 'fileNameTemplate';
  const [currentTemplate, setCurrentTemplate] = useState('%(title)s.%(ext)s');
  const [selectedPreset, setSelectedPreset] = useState('%(title)s.%(ext)s');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isCustom = selectedPreset === 'custom';
  const selectedLabel =
    presetOptions.find((o) => o.value === selectedPreset)?.label || 'Custom';

  useEffect(() => {
    const fetchInitialState = async () => {
      const settings = await window.ipcRenderer.invoke('get-settings');
      const template = settings?.[settingKey];
      if (template) {
        const matchingPreset = presetOptions.find((p) => p.value === template);
        setSelectedPreset(matchingPreset ? matchingPreset.value : 'custom');
        setCurrentTemplate(template);
      }
    };
    fetchInitialState();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSetting = (value: string) => {
    window.ipcRenderer.invoke('set-setting', { key: settingKey, value });
  };

  const handleSelectOption = (option: (typeof presetOptions)[0]) => {
    setSelectedPreset(option.value);
    setIsOpen(false);
    if (option.value !== 'custom') {
      setCurrentTemplate(option.value);
      saveSetting(option.value);
    }
  };

  const handleCustomInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value.trim();
    if (newValue) {
      setCurrentTemplate(newValue);
      saveSetting(newValue);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-medium text-slate-300">
            File Naming Convention
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-48 flex justify-between items-center p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <span>{selectedLabel}</span>
              <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                <FaChevronDown className="text-xs" />
              </motion.div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 overflow-hidden"
                >
                  <ul>
                    {presetOptions.map((option) => (
                      <li key={option.value}>
                        <button
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left p-2 text-sm transition-colors ${
                            selectedPreset === option.value
                              ? 'bg-purple-600 text-white font-semibold'
                              : 'text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="relative flex items-center group">
            <IoIosInformationCircleOutline className="text-slate-300 text-2xl" />
            <div className="absolute bottom-full right-0 z-10 mb-2 w-72 p-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Define the template for downloaded filenames using yt-dlp syntax.
              Common variables: %(title)s, %(uploader)s, %(ext)s.
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isCustom && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="pl-1"
          >
            <input
              type="text"
              value={currentTemplate}
              onChange={(e) => setCurrentTemplate(e.target.value)}
              onBlur={handleCustomInputBlur}
              placeholder="Enter custom template..."
              className="w-full p-2 bg-slate-700/80 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileNameSetting;
