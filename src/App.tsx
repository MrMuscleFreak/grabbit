import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';
import YouTubeView from './views/YouTubeView';
import InstagramView from './views/InstagramView';
import TikTokView from './views/TikTokView';
import SpotifyView from './views/SpotifyView';
import OtherView from './views/OtherView';
import ConvertView from './views/ConvertView';
import SettingsView from './views/SettingsView';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeLink, setActiveLink] = useState('YouTube');
  const [versions, setVersions] = useState({
    app: 'Checking...',
    ytdlp: 'Checking...',
    ffmpeg: 'Checking...',
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
        setVersions({ app: 'N/A', ytdlp: 'N/A', ffmpeg: 'N/A' });
      }
    };
    fetchVersions();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeLink) {
      case 'YouTube':
        return <YouTubeView />;
      case 'Instagram':
        return <InstagramView />;
      case 'TikTok':
        return <TikTokView />;
      case 'Spotify':
        return <SpotifyView />;
      case 'Other':
        return <OtherView />;
      case 'Images':
      case 'Audios':
      case 'Videos':
        return <ConvertView />;
      case 'Settings':
        return <SettingsView versions={versions}/>;
      default:
        return <YouTubeView />;
    }
  };

  return (
    <div className="flex">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeLink={activeLink}
        setActiveLink={setActiveLink}
      />
      <div className="flex-1 h-[calc(100vh-32px)] flex flex-col items-center">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
