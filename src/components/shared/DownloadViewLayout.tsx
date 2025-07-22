import { motion, AnimatePresence } from 'framer-motion';
import URLForm from './URLForm';

interface DownloadViewLayoutProps {
  icon: React.ElementType;
  iconClassName?: string;
  title: string;
  subtitle: string;
  url: string;
  setUrl: (url: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  showInitialContent: boolean;
  placeholder?: string;
  children: React.ReactNode;
}

const DownloadViewLayout: React.FC<DownloadViewLayoutProps> = ({
  icon: Icon,
  iconClassName = 'text-white',
  title,
  subtitle,
  url,
  setUrl,
  handleSubmit,
  isLoading,
  showInitialContent,
  placeholder,
  children,
}) => {
  return (
    <div
      className={`w-full h-full flex flex-col items-center transition-all duration-500 overflow-y-auto ${
        showInitialContent ? 'justify-center' : 'justify-start pt-12'
      }`}
    >
      <motion.div
        layout
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
        className="w-full max-w-2xl flex flex-col items-center flex-shrink-0"
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`text-6xl ${iconClassName}`} />
          <span className="text-4xl font-bold text-white">{title}</span>
        </div>

        <AnimatePresence>
          {showInitialContent && (
            <motion.p
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="text-slate-400 text-center mb-6 max-w-md"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>

        <URLForm
          url={url}
          setUrl={setUrl}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          placeholder={placeholder}
        />
      </motion.div>

      <div className="w-full max-w-2xl mt-4 space-y-4 flex flex-col items-center">
        <AnimatePresence>{children}</AnimatePresence>
      </div>
    </div>
  );
};

export default DownloadViewLayout;
