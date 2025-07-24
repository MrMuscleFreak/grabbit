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
  frameratePreference: string;
  fileNameTemplate: string;
  customYtdlpArgs: string;
  debugMode: boolean;
};

const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
    overwriteFiles: false,
    embedThumbnails: true,
    embedMetadata: true,
    defaultVideoFormat: 'mp4',
    defaultAudioFormat: 'mp3',
    frameratePreference: 'auto',
    fileNameTemplate: '%(title)s.%(ext)s',
    customYtdlpArgs: '',
    debugMode: false,
  },
});

export default store;
