import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import TitleBar from './components/TitleBar.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className=" min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 via-gray-800 to-slate-800 font-sans">
      <TitleBar />
      <main className="pt-8 m-0">
        <App />
      </main>
    </div>
  </React.StrictMode>
);

// Use contextBridge
window.ipcRenderer.on('main-process-message', (_event, message) => {
  console.log(message);
});
