import { ipcMain, app, BrowserWindow } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execFile } from "node:child_process";
function getBinaryPath(binaryName) {
  const platform = process.platform;
  let binaryFile = "";
  if (platform === "win32") {
    binaryFile = path.join("win", `${binaryName}.exe`);
  } else if (platform === "darwin") {
    const macBinaryName = "yt-dlp_macos";
    binaryFile = path.join("mac", macBinaryName);
  } else {
    throw new Error(`Unsupported platform for binaries: ${platform}`);
  }
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "bin", binaryFile);
  }
  return path.join(app.getAppPath(), "bin", binaryFile);
}
ipcMain.handle("get-video-info", async (_, url) => {
  const ytdlpPath = getBinaryPath("yt-dlp");
  const args = ["--dump-json", url];
  console.log(`Fetching info for: ${url} using ${ytdlpPath}`);
  return new Promise((resolve) => {
    execFile(ytdlpPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error(`yt-dlp error: ${stderr}`);
        resolve({ success: false, error: "Failed to fetch video info." });
        return;
      }
      try {
        const data = JSON.parse(stdout);
        const videoDetails = {
          thumbnail: data.thumbnail,
          title: data.title,
          channel: data.channel
        };
        resolve({ success: true, details: videoDetails });
      } catch (e) {
        console.error("Failed to parse yt-dlp output:", e);
        resolve({ success: false, error: "Could not parse video data." });
      }
    });
  });
});
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1080,
    // Example: Using 4:3 aspect ratio
    height: 720,
    resizable: false,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 8, y: 8 },
    backgroundColor: "#fff",
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
