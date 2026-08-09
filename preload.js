const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {

  minimize: () =>
    ipcRenderer.send("window-minimize"),

  close: () =>
    ipcRenderer.send("window-close"),

  toggleAlwaysOnTop: () =>
    ipcRenderer.send("window-toggle-top"),

  getWindowState: () =>
    ipcRenderer.invoke("get-window-state"),


  // ================================
  // INICIAR COM O WINDOWS
  // ================================

  getStartupState: () =>
    ipcRenderer.invoke("get-startup-state"),

  setStartup: (enabled) =>
    ipcRenderer.send("set-startup", enabled),

  notifySettingsOpen: () =>
    ipcRenderer.send("settings-panel-open"),

  notifySettingsClose: () =>
    ipcRenderer.send("settings-panel-close"),

  resizeWindow: (width, height) =>
    ipcRenderer.send("window-resize", { width, height })

});