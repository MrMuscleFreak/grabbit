import Store from 'electron-store';
import { app } from 'electron';

// config schema
type StoreSchema = {
  downloadPath: string;
  overwriteFiles: boolean;
  embedThumbnails: boolean;
  embedMetadata: boolean;
  defaultVideoFormat: string;
  defaultAudioFormat: string;
  defaultImageFormat: string;
  frameratePreference: string;
  fileNameTemplate: string;
  customYtdlpArgs: string;
  debugMode: boolean;
  enableVerboseLogging: boolean;
};

const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
    overwriteFiles: false,
    embedThumbnails: true,
    embedMetadata: true,
    defaultVideoFormat: 'mp4',
    defaultAudioFormat: 'mp3',
    defaultImageFormat: 'jpg',
    frameratePreference: 'auto',
    fileNameTemplate: '%(title)s.%(ext)s',
    customYtdlpArgs: '',
    debugMode: false,
    enableVerboseLogging: false,
  },
});

export default store;
