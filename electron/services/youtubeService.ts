import { IpcMain } from 'electron';
import { execFile } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';
import store from '../utils/store';
import path from 'node:path';
import { spawn } from 'node:child_process';
import log from 'electron-log/main';
import https from 'https';
import { createWriteStream, WriteStream } from 'fs';

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
        if (stderr && !error) {
          log.warn(`yt-dlp warning: ${stderr}`);
        }
        if (error) {
          log.error(`yt-dlp execution error: ${error.message}`);
          const errorMessage = stderr
            ? `Failed to fetch video info. Details: ${stderr}`
            : 'Failed to fetch video info.';
          resolve({ success: false, error: errorMessage });
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
      const enableVerboseLogging = store.get('enableVerboseLogging');

      log.log(
        `Starting download: ${url}, Quality: ${quality}, Format: ${format}`
      );

      let args: string[] = [];
      //'--progress' flag to get progress updates from yt-dlp
      const commonArgs = [url, '--progress', '-o', outputPath, '-4'];

      if (enableVerboseLogging) {
        commonArgs.push('--verbose');
      }

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

        if (enableVerboseLogging) {
          log.info(`[yt-dlp]: ${output}`);
        }

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

  ipcMain.on(
    'download-thumbnail',
    async (
      _,
      { thumbnailUrl, title }: { thumbnailUrl: string; title: string }
    ) => {
      const downloadPath = store.get('downloadPath');
      const imageFormat = store.get('defaultImageFormat', 'jpg');
      // Sanitize the title to create a safe filename
      const sanitizedTitle = title.replace(/[/\\?%*:|"<>]/g, '-');
      const filePath = path.join(
        downloadPath,
        `${sanitizedTitle}_thumbnail.${imageFormat}`
      );

      const fileStream = createWriteStream(filePath);
      https
        .get(
          thumbnailUrl,
          (response: { pipe: (arg0: WriteStream) => void }) => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              log.info(`Thumbnail downloaded successfully: ${filePath}`);
            });
          }
        )
        .on('error', (err: unknown) => {
          log.error('Failed to download thumbnail:', err);
        });
    }
  );
}
