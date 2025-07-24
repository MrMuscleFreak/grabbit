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
};

const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
    overwriteFiles: false,
    embedThumbnails: true,
    embedMetadata: true,
    defaultVideoFormat: 'mp4',
    defaultAudioFormat: 'mp3',
  },
});

export default store;
