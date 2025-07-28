import { IpcMain } from 'electron';
import { execFile, spawn } from 'node:child_process';
import { getBinaryPath } from '../utils/binaries';
import store from '../utils/store';
import path from 'node:path';
import log from 'electron-log/main';
import https from 'https';
import { createWriteStream } from 'fs';

// Type definitions for yt-dlp TikTok response
interface TikTokPlaylistEntry {
  id: string;
  title?: string;
  thumbnail?: string;
  url: string;
  uploader?: string;
}

interface TikTokPlaylistData {
  _type: 'playlist';
  title?: string;
  uploader?: string;
  thumbnail?: string;
  entries: TikTokPlaylistEntry[];
}

interface TikTokSingleData {
  _type?: 'video' | undefined;
  id: string;
  title?: string;
  uploader?: string;
  thumbnail?: string;
  webpage_url: string;
}

type TikTokData = TikTokPlaylistData | TikTokSingleData;

export function registerTikTokHandlers(ipcMain: IpcMain) {
  // Fetch TikTok video information using yt-dlp
  ipcMain.handle('get-tiktok-info', async (_, url: string) => {
    const ytdlpPath = getBinaryPath('yt-dlp');
    const args = [url, '--flat-playlist', '--dump-single-json', '-4'];

    return new Promise((resolve) => {
      execFile(ytdlpPath, args, (error, stdout, stderr) => {
        if (stderr && !error) {
          log.warn(`yt-dlp warning (TikTok): ${stderr}`);
        }
        if (error) {
          log.error(`yt-dlp execution error (TikTok): ${error.message}`);
          const errorMessage = stderr
            ? `Failed to fetch TikTok video info. Details: ${stderr}`
            : 'Failed to fetch TikTok video info.';
          resolve({ success: false, error: errorMessage });
          return;
        }

        try {
          const data: TikTokData = JSON.parse(stdout);
          const videos = [];
          let postTitle = null;

          // Extract username from uploader or title
          const extractUsername = (
            uploader: string | undefined,
            title: string | undefined
          ): string => {
            if (uploader) return uploader;
            if (title) {
              // Try to extract username from title patterns
              const match = title.match(/@([a-zA-Z0-9_.]+)/);
              if (match) return match[1];
            }
            return 'Unknown';
          };

          // TikTok collections/playlists (rare, but possible)
          if (data._type === 'playlist') {
            const username = extractUsername(data.uploader, data.title);
            postTitle = data.title || `Videos by ${username}`;
            videos.push(
              ...data.entries.map(
                (entry: TikTokPlaylistEntry, index: number) => ({
                  id: entry.id,
                  title: entry.title || `Video ${index + 1}`,
                  channel: username,
                  thumbnail: entry.thumbnail || data.thumbnail,
                  url: entry.url,
                })
              )
            );
          } else {
            // Single TikTok video (most common case)
            const username = extractUsername(data.uploader, data.title);
            postTitle = data.title || `Video by ${username}`;
            videos.push({
              id: data.id,
              title: data.title || `Video by ${username}`,
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
          log.error('Failed to parse yt-dlp output (TikTok):', e);
          resolve({
            success: false,
            error: 'Could not parse TikTok video data.',
          });
        }
      });
    });
  });

  // Handler to download TikTok media
  ipcMain.on(
    'download-tiktok-media',
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
        `Starting TikTok download: ${url}, Quality: ${quality}, Format: ${format}`
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
          'bestaudio/best',
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

      log.debug('Running yt-dlp command (TikTok):', ytdlpPath, args);
      const child = spawn(ytdlpPath, args);

      child.stdout.on('data', (data: Buffer) => {
        const output = data.toString();
        if (enableVerboseLogging) {
          log.info(`[yt-dlp-tiktok]: ${output}`);
        }
        const progressMatch = output.match(/\[download\]\s+([\d.]+)%/);
        if (progressMatch && progressMatch[1]) {
          const progress = parseFloat(progressMatch[1]);
          event.sender.send('download-progress', { progress });
        }
      });

      child.stderr.on('data', (data: Buffer) => {
        log.error(`yt-dlp stderr (TikTok): ${data.toString()}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          event.sender.send('download-complete', { success: true });
        } else {
          event.sender.send('download-complete', {
            success: false,
            error: 'TikTok download failed.',
          });
        }
      });
    }
  );

  // Handler to download TikTok thumbnails
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
              log.info(`TikTok thumbnail downloaded successfully: ${filePath}`);
            });
          }
        )
        .on('error', (err: unknown) => {
          log.error('Failed to download TikTok thumbnail:', err);
        });
    }
  );
}
