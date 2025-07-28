import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { createRequire } from 'node:module';
import { session } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import log from 'electron-log/main';
import { registerYouTubeHandlers } from './services/youtubeService';
import { registerSettingsHandlers } from './services/settingsService';
import store from './utils/store';
import { execFile } from 'node:child_process';
import { getBinaryPath } from './utils/binaries';
import { registerInstagramHandlers } from './services/instagramService';

// services registration
log.initialize();

registerYouTubeHandlers(ipcMain);
registerInstagramHandlers(ipcMain);
registerSettingsHandlers(ipcMain);

// Configure logger based on settings
log.transports.file.level = 'info';
log.transports.console.level = 'info';
if (store.get('debugMode')) {
  log.transports.console.level = 'debug'; // Show debug messages in console
  log.info('Debug mode enabled. Console logging level set to "debug".');
}

log.info('App starting...');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
    width: 1080,
    height: 720,
    resizable: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 8, y: 8 },
    backgroundColor: '#fff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    win = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('open-log-file', () => {
  shell.openPath(log.transports.file.getFile().path);
});

// Replace the old 'get-app-version' handler with this one
ipcMain.handle('get-versions', async () => {
  const ytdlpPath = getBinaryPath('yt-dlp');
  const ffmpegPath = getBinaryPath('ffmpeg');

  const getVersion = (path: string, args: string[]): Promise<string> => {
    return new Promise((resolve) => {
      execFile(path, args, (error, stdout) => {
        if (error) {
          resolve('N/A');
          return;
        }
        // ffmpeg version is on the first line
        resolve(stdout.split('\n')[0]);
      });
    });
  };

  try {
    const [ytdlpVersion, ffmpegVersionOutput] = await Promise.all([
      getVersion(ytdlpPath, ['--version']),
      getVersion(ffmpegPath, ['-version']),
    ]);

    // Extract just the version number from ffmpeg's output
    const ffmpegVersionMatch = ffmpegVersionOutput.match(
      /ffmpeg version ([\d.]+)/
    );
    const ffmpegVersion = ffmpegVersionMatch ? ffmpegVersionMatch[1] : 'N/A';

    return {
      app: app.getVersion(), // Use app.getVersion() here
      ytdlp: ytdlpVersion.trim(),
      ffmpeg: ffmpegVersion,
    };
  } catch (e) {
    return { app: app.getVersion(), ytdlp: 'N/A', ffmpeg: 'N/A' };
  }
});

app.whenReady().then(() => {
  // Configure session to handle Instagram images
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://*.fbcdn.net/*', 'https://*.cdninstagram.com/*'] },
    (details: Electron.OnBeforeSendHeadersListenerDetails, callback) => {
      details.requestHeaders['User-Agent'] =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      details.requestHeaders['Referer'] = 'https://www.instagram.com/';
      callback({ requestHeaders: details.requestHeaders });
    }
  );

  createWindow();
});
