import Store from 'electron-store';
import { app } from 'electron';

// config schema
type StoreSchema = {
  downloadPath: string;
  overwriteFiles: boolean;
  embedThumbnails: boolean;
};

const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
    overwriteFiles: false,
    embedThumbnails: true,
  },
});

export default store;
