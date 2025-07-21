import { IpcMain } from 'electron';
import { execFile } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';

export function registerYouTubeHandlers(ipcMain: IpcMain) {
  ipcMain.handle('get-video-info', async (_, url: string) => {
    const ytdlpPath = getBinaryPath('yt-dlp');
    const args = [url, '--dump-json', '-4'];

    return new Promise((resolve) => {
      execFile(ytdlpPath, args, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(
            `yt-dlp error: ${stderr || (error ? error.message : '')}`
          );
          resolve({ success: false, error: 'Failed to fetch video info.' });
          return;
        }
        try {
          const data = JSON.parse(stdout);
          const videoDetails = {
            thumbnail: data.thumbnail,
            title: data.title,
            channel: data.channel,
          };
          resolve({ success: true, details: videoDetails });
        } catch (e) {
          console.error('Failed to parse yt-dlp output:', e);
          resolve({ success: false, error: 'Could not parse video data.' });
        }
      });
    });
  });

  // TODO: download youtube media
}
