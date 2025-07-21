import Store from 'electron-store';
import { app } from 'electron';

// config schema
type StoreSchema = {
  downloadPath: string;
};

const store = new Store<StoreSchema>({
  defaults: {
    downloadPath: app.getPath('downloads'),
  },
});

export default store;
