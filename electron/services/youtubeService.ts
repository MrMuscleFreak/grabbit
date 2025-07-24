import { IpcMain } from 'electron';
import { execFile } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';
import store from '../utils/store';
import path from 'node:path';
import { spawn } from 'node:child_process';
import log from 'electron-log/main';

type PlaylistEntry = {
  id: string;
  title: string;
  channel: string;
  url: string;
};

export function registerYouTubeHandlers(ipcMain: IpcMain) {
  ipcMain.handle('get-video-info', async (_, url: string) => {
    const ytdlpPath = getBinaryPath('yt-dlp');
    const args = [url, '--flat-playlist', '--dump-single-json', '-4'];

    return new Promise((resolve) => {
      execFile(ytdlpPath, args, (error, stdout, stderr) => {
        if (error || stderr) {
          log.error(`yt-dlp error: ${stderr || (error ? error.message : '')}`);
          resolve({ success: false, error: 'Failed to fetch video info.' });
          return;
        }
        try {
          const data = JSON.parse(stdout);
          let videos = [];
          let playlistTitle = null;

          if (data._type === 'playlist') {
            // playlist
            playlistTitle = data.title;
            videos = data.entries.map((entry: PlaylistEntry) => ({
              id: entry.id,
              title: entry.title,
              channel: entry.channel,
              thumbnail: `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
              url: entry.url,
            }));
          } else {
            // video
            videos.push({
              id: data.id,
              title: data.title,
              channel: data.channel,
              thumbnail: data.thumbnail,
              url: data.webpage_url,
            });
          }
          resolve({
            success: true,
            videos: videos,
            playlistTitle: playlistTitle,
          });
        } catch (e) {
          log.error('Failed to parse yt-dlp output:', e);
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
      const fileNameTemplate = store.get('fileNameTemplate');
      const outputPath = path.join(downloadPath, fileNameTemplate);

      // settings
      const embedThumbnails = store.get('embedThumbnails');
      const overwriteFiles = store.get('overwriteFiles');
      const embedMetadata = store.get('embedMetadata');
      const defaultVideoFormat = store.get('defaultVideoFormat');
      const defaultAudioFormat = store.get('defaultAudioFormat');
      const frameratePreference = store.get('frameratePreference');
      const customYtdlpArgs = store.get('customYtdlpArgs');

      let args: string[] = [];
      //'--progress' flag to get progress updates from yt-dlp
      const commonArgs = [url, '--progress', '-o', outputPath, '-4'];

      if (overwriteFiles) {
        commonArgs.push('--force-overwrites');
      }

      if (embedMetadata) {
        commonArgs.push('--add-metadata');
      }

      if (
        format !== 'mp3' &&
        frameratePreference &&
        frameratePreference !== 'auto'
      ) {
        commonArgs.push('--match-filter', `fps = ${frameratePreference}`);
      }

      if (format === 'mp3') {
        args = [
          ...commonArgs,
          '-f',
          quality,
          '--extract-audio',
          '--audio-format',
          defaultAudioFormat,
          '--ffmpeg-location',
          ffmpegPath,
        ];

        // Add thumbnail embed arg only for audio files
        if (embedThumbnails) {
          args.push('--embed-thumbnail');
        }
      } else {
        args = [
          ...commonArgs,
          '-f',
          quality,
          '--merge-output-format',
          defaultVideoFormat,
          '--ffmpeg-location',
          ffmpegPath,
        ];
      }
      if (customYtdlpArgs && customYtdlpArgs.trim() !== '') {
        // Split the string by spaces to get an array of arguments
        const customArgsArray = customYtdlpArgs.trim().split(/\s+/);
        args.push(...customArgsArray);
      }

      log.log('Running yt-dlp command:', ytdlpPath, args);
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
        log.error(`yt-dlp stderr: ${data.toString()}`);
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
