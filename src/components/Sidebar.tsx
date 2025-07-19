import { motion, AnimatePresence } from 'framer-motion';
import {
  FaVideo,
  FaInstagram,
  FaTiktok,
  FaSpotify,
  FaSoundcloud,
  FaImage,
  FaDownload,
} from 'react-icons/fa';
import { MdAudiotrack } from 'react-icons/md';
import { PiDotsThreeCircle } from 'react-icons/pi';
import { LuSettings } from 'react-icons/lu';
import { FaAngleLeft, FaYoutube, FaArrowRightArrowLeft } from 'react-icons/fa6';

interface NavLink {
  name: string;
  icon: React.ElementType;
  isSeparator?: boolean;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeLink: string;
  setActiveLink: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  toggleSidebar,
  activeLink,
  setActiveLink,
}) => {
  const navLinks: NavLink[] = [
    { name: 'Download Media', icon: FaDownload, isSeparator: true },
    { name: 'YouTube', icon: FaYoutube },
    { name: 'Instagram', icon: FaInstagram },
    { name: 'TikTok', icon: FaTiktok },
    { name: 'Spotify', icon: FaSpotify },
    { name: 'SoundCloud', icon: FaSoundcloud },
    { name: 'Other', icon: PiDotsThreeCircle },
    { name: 'Convert Media', icon: FaArrowRightArrowLeft, isSeparator: true },
    { name: 'Images', icon: FaImage },
    { name: 'Audios', icon: MdAudiotrack },
    { name: 'Videos', icon: FaVideo },
  ];
  const settingsLink: NavLink = { name: 'Settings', icon: LuSettings };

  const handleLinkClick = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    setActiveLink(name);
  };

  const textAnimation = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.1 } },
    exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
  };

  return (
    <motion.aside
      animate={{ width: isSidebarOpen ? 230 : 74 }} // w-64 : w-20
      transition={{
        duration: 0.2,
        ease: 'easeInOut',
      }}
      className="h-[calc(100vh-32px)] bg-slate-800/50 border-r border-slate-700 p-4 flex flex-col "
    >
      {/* text and Toggle Button */}
      <div
        className={`flex items-center mb-2 ${
          isSidebarOpen ? 'justify-between' : 'justify-center'
        }`}
      >
        {/* Animated Text Container */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 overflow-hidden"
            >
              <span className="font-bold text-xl text-white whitespace-nowrap">
                Grabber
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle icon */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-slate-700"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <FaAngleLeft className="text-1.5xl text-slate-400" />
          </motion.div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow">
        <ul>
          {navLinks.map((link) => {
            const Icon = link.icon;

            // seperator
            if (link.isSeparator) {
              return (
                <li key={link.name} className="first:mt-2 px-3 mt-8">
                  <div className="relative flex items-center justify-center h-8">
                    <Icon
                      className="text-slate-500"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <AnimatePresence>
                      {isSidebarOpen && (
                        <motion.span
                          variants={textAnimation}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="text-slate-500 text-xs font-semibold uppercase tracking-wider ml-2"
                        >
                          {link.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              );
            }
            const isActive = activeLink === link.name;
            return (
              <li key={link.name} className="py-0.5 first:mt-0">
                <a
                  href="#"
                  onClick={(e) => handleLinkClick(e, link.name)}
                  className={`
                    flex items-center p-2 rounded-lg transition-colors duration-200 justify-start gap-4
                    ${
                      isActive
                        ? 'bg-purple-600/30 font-semibold'
                        : 'hover:bg-slate-700/60'
                    }
                  `}
                >
                  <span
                    className="flex justify-center items-center"
                    style={{ width: '1.5rem' }}
                  >
                    <Icon
                      className={`transition-colors text-2xl ${
                        isActive ? 'text-purple-300' : 'text-white'
                      }`}
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    />
                  </span>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        variants={textAnimation}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`whitespace-nowrap ${
                          isActive ? 'text-purple-300' : 'text-white'
                        }`}
                      >
                        {link.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* settings */}
      <div className="mt-auto">
        <ul>
          <li>
            {((): React.ReactNode => {
              const Icon = settingsLink.icon;
              const isActive = activeLink === settingsLink.name;
              return (
                <a
                  href="#"
                  onClick={(e) => handleLinkClick(e, settingsLink.name)}
                  className={`
                    flex items-center p-2 rounded-lg transition-colors duration-200 justify-start gap-3
                    ${
                      isActive
                        ? 'bg-purple-600/30 font-semibold'
                        : 'hover:bg-slate-700/60'
                    }
                  `}
                >
                  <span
                    className="flex justify-center items-center"
                    style={{ width: '1.5rem' }}
                  >
                    <Icon
                      className={`transition-colors text-2xl ${
                        isActive ? 'text-purple-300' : 'text-white'
                      }`}
                      style={{ minWidth: '1.5rem', minHeight: '1.5rem' }}
                    />
                  </span>
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        variants={textAnimation}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`whitespace-nowrap ${
                          isActive ? 'text-purple-300' : 'text-white'
                        }`}
                      >
                        {settingsLink.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </a>
              );
            })()}
          </li>
        </ul>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
