import { FaArrowRight } from 'react-icons/fa6';

type URLFormProps = {
  url: string;
  setUrl: (url: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder?: string;
};

const URLForm = ({
  url,
  setUrl,
  handleSubmit,
  isLoading,
  placeholder,
}: URLFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={placeholder || 'Paste a link here...'}
        className="w-full p-3 pr-12 text-lg bg-slate-700/50 text-white placeholder-slate-500 rounded-2xl border-2 border-slate-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FaArrowRight />
        )}
      </button>
    </form>
  );
};

export default URLForm;
