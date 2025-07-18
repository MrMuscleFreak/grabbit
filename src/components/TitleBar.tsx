const TitleBar = () => {
  return (
    <div
      className="fixed top-0 left-0 w-full h-8 bg-slate-800/50 border-b border-slate-700"
      style={
        { WebkitAppRegion: 'drag' } as React.CSSProperties & {
          WebkitAppRegion?: string;
        }
      }
    ></div>
  );
};

export default TitleBar;
