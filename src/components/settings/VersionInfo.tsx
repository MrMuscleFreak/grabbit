import { useState, useEffect } from 'react';

type VersionInfoProps = {
  appName: string;
};

const VersionInfo = ({ appName }: VersionInfoProps) => {
  const [versions, setVersions] = useState({
    app: '...',
    ytdlp: '...',
    ffmpeg: '...',
  });

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const allVersions = await window.ipcRenderer.invoke('get-versions');
        if (allVersions) {
          setVersions(allVersions);
        }
      } catch (error) {
        console.error('Failed to fetch versions:', error);
        // Set versions to 'N/A' on error to indicate failure
        setVersions({ app: 'N/A', ytdlp: 'N/A', ffmpeg: 'N/A' });
      }
    };
    fetchVersions();
  }, []);

  return (
    <div className="space-y-2 text-sm text-slate-400">
      <div className="flex justify-between">
        <span>{appName} Version</span>
        <span className="font-mono">{versions.app}</span>
      </div>
      <div className="flex justify-between">
        <span>yt-dlp Version</span>
        <span className="font-mono">{versions.ytdlp}</span>
      </div>
      <div className="flex justify-between">
        <span>FFmpeg Version</span>
        <span className="font-mono">{versions.ffmpeg}</span>
      </div>
    </div>
  );
};

export default VersionInfo;
