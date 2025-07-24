import { useState, useEffect, useRef } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { FaChevronDown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

type Option = {
  value: string;
  label: string;
};

type DropdownSettingProps = {
  settingKey: string;
  label: string;
  description?: string;
  options: Option[];
};

const DropdownSetting = ({
  settingKey,
  label,
  description,
  options,
}: DropdownSettingProps) => {
  const [selectedValue, setSelectedValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => o.value === selectedValue)?.label || options[0]?.label;

  useEffect(() => {
    const fetchInitialState = async () => {
      const settings = await window.ipcRenderer.invoke('get-settings');
      if (settings && typeof settings[settingKey] === 'string') {
        setSelectedValue(settings[settingKey]);
      } else if (options.length > 0) {
        setSelectedValue(options[0].value);
      }
    };
    fetchInitialState();
  }, [settingKey, options]);

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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  const handleSelectOption = async (option: Option) => {
    setSelectedValue(option.value);
    setIsOpen(false);
    await window.ipcRenderer.invoke('set-setting', {
      key: settingKey,
      value: option.value,
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-base font-medium text-slate-300">{label}</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-36 flex justify-between items-center p-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 w-36 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-20 overflow-hidden"
              >
                <ul>
                  {options.map((option) => (
                    <li key={option.value}>
                      <button
                        onClick={() => handleSelectOption(option)}
                        className={`w-full text-left p-2 text-sm transition-colors ${
                          selectedValue === option.value
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

        {description && (
          <div className="relative flex items-center group">
            <IoIosInformationCircleOutline className="text-slate-300 text-2xl" />
            <div className="absolute bottom-full right-0 z-10 mb-2 w-60 p-2 bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              {description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownSetting;
