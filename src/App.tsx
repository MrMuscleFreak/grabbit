import Sidebar from './components/Sidebar';
import { useState } from 'react';

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div>
      <div className="flex">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <h1 className="text-3xl font-bold text-white p-4">Grabber</h1>
      </div>
    </div>
  );
}

export default App;
