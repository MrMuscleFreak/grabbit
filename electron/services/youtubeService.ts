import { IpcMain } from 'electron';
import { execFile } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';
import store from '../utils/store';
import path from 'node:path';
import { spawn } from 'node:child_process';

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

  ipcMain.on(
    'download-youtube-media',
    (
      event,
      {
        url,
        quality,
        format,
      }: { url: string; quality: string; format: 'mp4' | 'mp3' }
    ) => {
      const ytdlpPath = getBinaryPath('yt-dlp');
      const ffmpegPath = path.dirname(getBinaryPath('ffmpeg'));
      const downloadPath = store.get('downloadPath');
      const outputPath = path.join(downloadPath, '%(title)s.%(ext)s');

      let args: string[] = [];
      //'--progress' flag to get progress updates from yt-dlp
      const commonArgs = [url, '--progress', '-o', outputPath, '-4'];

      if (format === 'mp3') {
        args = [
          ...commonArgs,
          '-f',
          quality,
          '--extract-audio',
          '--audio-format',
          'mp3',
          '--ffmpeg-location',
          ffmpegPath,
        ];
      } else {
        args = [
          ...commonArgs,
          '-f',
          quality,
          '--merge-output-format',
          'mp4',
          '--ffmpeg-location',
          ffmpegPath,
        ];
      }

      const child = spawn(ytdlpPath, args);

      child.stdout.on('data', (data: Buffer) => {
        const output = data.toString();

        // Regex to find the percentage from yt-dlp's output
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch && progressMatch[1]) {
          const progress = parseFloat(progressMatch[1]);
          // Send a progress update event to the renderer process
          event.sender.send('download-progress', { progress });
        }
      });

      // Listen for errors
      child.stderr.on('data', (data: Buffer) => {
        console.error(`yt-dlp stderr: ${data.toString()}`);
      });

      // Listen for the process to close
      child.on('close', (code) => {
        if (code === 0) {
          // Send a completion event
          event.sender.send('download-complete', { success: true });
        } else {
          event.sender.send('download-complete', {
            success: false,
            error: 'Download failed.',
          });
        }
      });
    }
  );
}
