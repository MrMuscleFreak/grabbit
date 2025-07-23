import { IpcMain, dialog } from 'electron';
import store from '../utils/store';

export function registerSettingsHandlers(ipcMain: IpcMain) {
  // Handler to get all current settings
  ipcMain.handle('get-settings', async () => {
    return store.store;
  });

  // Handler to open the system file dialog and save the selected path
  ipcMain.handle('select-directory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (canceled || filePaths.length === 0) {
      return { success: false };
    }

    const selectedPath = filePaths[0];
    store.set('downloadPath', selectedPath);
    return { success: true, path: selectedPath };
  });
  ipcMain.handle(
    'set-setting',
    async (_, { key, value }: { key: string; value: unknown }) => {
      try {
        store.set(key, value);
        return { success: true };
      } catch (error) {
        console.error(`Failed to set setting '${key}':`, error);
        return { success: false };
      }
    }
  );
}
