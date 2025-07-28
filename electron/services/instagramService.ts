import { IpcMain } from 'electron';
import { execFile, spawn } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';
import store from '../utils/store';
import path from 'node:path';
import log from 'electron-log/main';
import https from 'https';
import { createWriteStream } from 'fs';
interface InstagramPlaylistEntry {
  id: string;
  title?: string;
  thumbnail?: string;
  url: string;
  uploader?: string;
}

interface InstagramPlaylistData {
  _type: 'playlist';
  title?: string;
  uploader?: string;
  thumbnail?: string;
  entries: InstagramPlaylistEntry[];
}

interface InstagramSingleData {
  _type?: 'video' | undefined;
  id: string;
  title?: string;
  uploader?: string;
  thumbnail?: string;
  webpage_url: string;
}

type InstagramData = InstagramPlaylistData | InstagramSingleData;

export function registerInstagramHandlers(ipcMain: IpcMain) {
  // Fetch Instagram reel information using yt-dlp
  ipcMain.handle('get-instagram-info', async (_, url: string) => {
    const ytdlpPath = getBinaryPath('yt-dlp');
    const args = [url, '--flat-playlist', '--dump-single-json', '-4'];

    return new Promise((resolve) => {
      execFile(ytdlpPath, args, (error, stdout, stderr) => {
        if (stderr && !error) {
          log.warn(`yt-dlp warning (Instagram): ${stderr}`);
        }
        if (error) {
          log.error(`yt-dlp execution error (Instagram): ${error.message}`);
          const errorMessage = stderr
            ? `Failed to fetch Instagram post info. Details: ${stderr}`
            : 'Failed to fetch Instagram post info.';
          resolve({ success: false, error: errorMessage });
          return;
        }

        try {
          const data: InstagramData = JSON.parse(stdout);
          const videos = [];
          let postTitle = null;

          // Extract username from title
          const extractUsername = (title: string | undefined): string => {
            if (!title) return 'Unknown';
            const match = title.match(/Post by (.+)/);
            return match ? match[1] : 'Unknown';
          };

          // Instagram carousels with multiple video items are treated as playlists by yt-dlp
          if (data._type === 'playlist') {
            const username = extractUsername(data.title);
            postTitle = data.title || `Post by ${username}`;
            videos.push(
              ...data.entries.map(
                (entry: InstagramPlaylistEntry, index: number) => ({
                  id: entry.id,
                  title: entry.title || `Video ${index + 1}`,
                  channel: username,
                  thumbnail: entry.thumbnail || data.thumbnail,
                  url: entry.url,
                })
              )
            );
          } else {
            // Single video post
            const username = extractUsername(data.title);
            postTitle = data.title || `Post by ${username}`;
            videos.push({
              id: data.id,
              title: data.title || `Media from ${username}`,
              channel: username,
              thumbnail: data.thumbnail,
              url: data.webpage_url,
            });
          }

          resolve({
            success: true,
            videos: videos,
            postTitle: postTitle,
          });
        } catch (e) {
          log.error('Failed to parse yt-dlp output (Instagram):', e);
          resolve({
            success: false,
            error: 'Could not parse Instagram post data.',
          });
        }
      });
    });
  });

  // Handler to download Instagram media
  ipcMain.on(
    'download-instagram-media',
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

      // Get settings
      const embedThumbnails = store.get('embedThumbnails');
      const overwriteFiles = store.get('overwriteFiles');
      const embedMetadata = store.get('embedMetadata');
      const defaultVideoFormat = store.get('defaultVideoFormat');
      const defaultAudioFormat = store.get('defaultAudioFormat');
      const enableVerboseLogging = store.get('enableVerboseLogging');

      log.log(
        `Starting Instagram download: ${url}, Quality: ${quality}, Format: ${format}`
      );

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

      let args: string[];
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

      log.debug('Running yt-dlp command (Instagram):', ytdlpPath, args);
      const child = spawn(ytdlpPath, args);

      child.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        if (enableVerboseLogging) {
          log.info(`[yt-dlp-instagram]: ${output}`);
        }
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch && progressMatch[1]) {
          const progress = parseFloat(progressMatch[1]);
          event.sender.send('download-progress', { progress });
        }
      });

      child.stderr.on('data', (data: Buffer) => {
        log.error(`yt-dlp stderr (Instagram): ${data.toString()}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          event.sender.send('download-complete', { success: true });
        } else {
          event.sender.send('download-complete', {
            success: false,
            error: 'Instagram download failed.',
          });
        }
      });
    }
  );

  // Handler to download Instagram thumbnails
  ipcMain.on(
    'download-thumbnail',
    async (
      _,
      { thumbnailUrl, title }: { thumbnailUrl: string; title: string }
    ) => {
      const downloadPath = store.get('downloadPath');
      const imageFormat = store.get('defaultImageFormat', 'jpg');
      const sanitizedTitle = title.replace(/[/\\?%*:|"<>]/g, '-');
      const filePath = path.join(
        downloadPath,
        `${sanitizedTitle}_thumbnail.${imageFormat}`
      );

      const fileStream = createWriteStream(filePath);
      https
        .get(
          thumbnailUrl,
          (response: { pipe: (arg0: import('fs').WriteStream) => void }) => {
            response.pipe(fileStream);
            fileStream.on('finish', () => {
              fileStream.close();
              log.info(
                `Instagram thumbnail downloaded successfully: ${filePath}`
              );
            });
          }
        )
        .on('error', (err: unknown) => {
          log.error('Failed to download Instagram thumbnail:', err);
        });
    }
  );
}
