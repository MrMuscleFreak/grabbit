import Sidebar from './components/Sidebar';
import { useState } from 'react';
import YouTubeView from './views/YouTubeView';
import InstagramView from './views/InstagramView';
import SoundCloudView from './views/SoundCloudView';
import TikTokView from './views/TikTokView';
import SpotifyView from './views/SpotifyView';
import OtherView from './views/OtherView';
import ConvertView from './views/ConvertView';
import SettingsView from './views/SettingsView';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeLink, setActiveLink] = useState('YouTube');

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
      case 'SoundCloud':
        return <SoundCloudView />;
      case 'Spotify':
        return <SpotifyView />;
      case 'Other':
        return <OtherView />;
      case 'Images':
      case 'Audios':
      case 'Videos':
        return <ConvertView />;
      case 'Settings':
        return <SettingsView />;
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
      {/* <div className="flex-1 p-4">{renderContent()}</div> */}
      <div className="flex-1 h-[calc(100vh-32px)] flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
