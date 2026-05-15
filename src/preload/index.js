import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

// Custom APIs for renderer
const api = {
  onAuthError: (callback) => ipcRenderer.on("authError", callback),
  onDisconnected: (callback) => ipcRenderer.on("disconnected", callback),
  onChangeState: (callback) => ipcRenderer.on("changeState", callback),
  onInitError: (callback) => ipcRenderer.on("initError", callback),
  onMsgResult: (callback) => ipcRenderer.on("onMsgResult", callback),
  onSessionClose: (callback) => ipcRenderer.on("onSessionClose", callback),
  // Notifica cuando el cliente/pagina de WhatsApp está cargando (true) o listo (false)
  onWsLoading: (callback) => ipcRenderer.on("wsLoading", callback),
  closeSession: () => ipcRenderer.invoke("closeSession"),
  getnewQR: () => ipcRenderer.invoke("getNewQR"),
  getReadyState: () => ipcRenderer.invoke("getReadyState"),
  getQR: (callback) => ipcRenderer.on("QR", (_, data) => callback(data)),
  isDev: (callback) => ipcRenderer.on("isDev", (_, data) => callback(data)),
  isReady: (callback) => ipcRenderer.on("ready", (_, data) => callback(data)),
  getCustomers: () => ipcRenderer.invoke("getCustomers"),
  getExcCustomers: () => ipcRenderer.invoke("getExcCustomers"),
  sendMsg: (msgTemplate, dbConfig, dbTable, debtorsArray) =>
    ipcRenderer.invoke("sendMsg", msgTemplate, dbConfig, dbTable, debtorsArray),
  getDebtors: (dbConfig, dbTable) =>
    ipcRenderer.invoke("getDebtors", dbConfig, dbTable),
  getDateSends: () => ipcRenderer.invoke("getDateSends"),
  testDbConnection: (dbConfig) =>
    ipcRenderer.invoke("testDbConnection", dbConfig),
  getTableRows: (dbConfig, tableName) =>
    ipcRenderer.invoke("getTableRows", dbConfig, tableName),
  parseExcelBuffer: (uint8arr) =>
    ipcRenderer.invoke("parseExcelBuffer", uint8arr),
  getWs: () => ipcRenderer.invoke("getWs"),
  updateExcCustomers: (excC) => ipcRenderer.invoke("updateExcCustomers", excC),
  sendMsgFromExcel: (fileDir) =>
    ipcRenderer.invoke("sendMsgFromExcel", fileDir),
  // recibir un ArrayBuffer/Uint8Array desde renderer y enviarlo al main
  sendExcelBuffer: (uint8arr, msgTemplate) =>
    ipcRenderer.invoke("sendExcelBuffer", uint8arr, msgTemplate),
  getMe: () => ipcRenderer.invoke("getMe"),
  getWhatsAppContacts: () => ipcRenderer.invoke("getWhatsAppContacts"),
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("electronAPI", {});
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
}
