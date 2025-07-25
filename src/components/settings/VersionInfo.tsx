type VersionInfoProps = {
  appName: string;
  versions: {
    app: string;
    ytdlp: string;
    ffmpeg: string;
  };
};

const VersionInfo = ({ appName, versions }: VersionInfoProps) => {
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
