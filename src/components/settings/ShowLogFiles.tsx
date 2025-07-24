const ShowLogFiles = () => {
  const handleShowLogFile = () => {
    window.ipcRenderer.send('open-log-file');
  };

  return (
    <div>
      <button
        onClick={handleShowLogFile}
        className="w-full text-center p-2 bg-purple-600 hover:bg-purple-500 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition-colors"
      >
        Show Log Files
      </button>
    </div>
  );
};

export default ShowLogFiles;
