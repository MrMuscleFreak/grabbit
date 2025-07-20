import { app } from 'electron';
import path from 'node:path';

export function getBinaryPath(binaryName: 'yt-dlp' | 'ffmpeg'): string {
  const platform = process.platform;
  let binaryFile = '';

  if (platform === 'win32') {
    binaryFile = path.join('win', `${binaryName}.exe`);
  } else if (platform === 'darwin') {
    const macBinaryName = binaryName === 'yt-dlp' ? 'yt-dlp_macos' : binaryName;
    binaryFile = path.join('mac', macBinaryName);
  } else {
    throw new Error(`Unsupported platform for binaries: ${platform}`);
  }

  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin', binaryFile);
  }

  return path.join(app.getAppPath(), 'bin', binaryFile);
}
