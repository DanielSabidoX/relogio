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

// =====================================================
// EXPANDIR A JANELA PARA CABER O PAINEL DE CONFIGURAÇÕES
// =====================================================
// A janela normal é baixinha (só o relógio). Quando o painel de
// configurações abre, ele precisa de mais espaço vertical pra não ser
// cortado pela borda da própria janela — então crescemos a janela
// (mantendo o canto superior esquerdo fixo) e devolvemos o tamanho
// original ao fechar.

const SETTINGS_EXTRA_HEIGHT = 220;
let heightBeforeSettings = null;

ipcMain.on("settings-panel-open", () => {
  if (!win) return;
  const bounds = win.getBounds();
  if (heightBeforeSettings === null) heightBeforeSettings = bounds.height;
  win.setBounds({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height + SETTINGS_EXTRA_HEIGHT
  });
});

ipcMain.on("settings-panel-close", () => {
  if (!win || heightBeforeSettings === null) return;
  const bounds = win.getBounds();
  win.setBounds({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: heightBeforeSettings
  });
  heightBeforeSettings = null;
});

// =====================================================
// REDIMENSIONAR MANUALMENTE (alça no canto)
// =====================================================
// A janela é frame:false, então não tem a borda nativa de redimensionar
// do Windows visível/fácil de pegar. A alça no canto (renderer.js) manda
// o tamanho desejado aqui, e o processo principal ajusta a janela de
// verdade, respeitando um mínimo e um máximo razoáveis.

const MIN_W = 350, MIN_H = 165;
const MAX_W = 1400, MAX_H = 640;

ipcMain.on("window-resize", (event, { width, height }) => {
  if (!win) return;
  const bounds = win.getBounds();
  const w = Math.round(Math.min(MAX_W, Math.max(MIN_W, width)));
  const h = Math.round(Math.min(MAX_H, Math.max(MIN_H, height)));
  win.setBounds({ x: bounds.x, y: bounds.y, width: w, height: h });
});