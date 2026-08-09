const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

let win;

function createWindow() {

  const display = screen.getPrimaryDisplay();
  const area = display.workArea;

  win = new BrowserWindow({
    width: 540,
    height: 215,

    minWidth: 350,
    minHeight: 165,

    x: Math.max(0, area.x + area.width - 540),
    y: Math.max(0, area.y + 18),

    frame: false,
    transparent: true,

    resizable: true,
    movable: true,

    alwaysOnTop: false,
    skipTaskbar: false,

    backgroundColor: "#00000000",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {

  createWindow();

});

app.on("window-all-closed", () => {

  if (process.platform !== "darwin") {
    app.quit();
  }

});

ipcMain.on("window-minimize", () => {
  win?.minimize();
});

ipcMain.on("window-close", () => {
  win?.close();
});

ipcMain.on("window-toggle-top", () => {

  if (!win) return;

  win.setAlwaysOnTop(
    !win.isAlwaysOnTop()
  );

});

ipcMain.handle("get-window-state", () => ({

  alwaysOnTop:
    win?.isAlwaysOnTop() ?? false

}));

// =====================================================
// INICIAR COM O WINDOWS
// =====================================================

ipcMain.handle("get-startup-state", () => {

  if (process.platform !== "win32") {
    return false;
  }

  return app.getLoginItemSettings().openAtLogin;
});


ipcMain.on("set-startup", (event, enabled) => {

  if (process.platform !== "win32") {
    return;
  }

  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    openAsHidden: false
  });

});