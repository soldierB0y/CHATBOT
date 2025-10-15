import { contextBridge,ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'



// Custom APIs for renderer
const api = {
  onAuthError: (callback) => ipcRenderer.on('authError', callback),
  onDisconnected: (callback) => ipcRenderer.on('disconnected', callback),
  onChangeState: (callback) => ipcRenderer.on('changeState', callback),
  onInitError: (callback) => ipcRenderer.on('initError', callback),
  onMsgResult:(callback)=> ipcRenderer.on('initError',callback),
  onSessionClose:(callback)=>ipcRenderer.on('onSessionClose',callback),
  closeSession:()=>ipcRenderer.invoke('closeSession'),
  getnewQR:()=>ipcRenderer.invoke('getNewQR'),
  getQR: (callback) => ipcRenderer.on("QR", (_, data) => callback(data)),
  isDev: (callback) => ipcRenderer.on("isDev", (_, data) => callback(data)),
  isReady: (callback) => ipcRenderer.on("ready", (_, data) => callback(data)),
  getCustomers: ()=>ipcRenderer.invoke('getCustomers'),
  getExcCustomers: ()=> ipcRenderer.invoke('getExcCustomers'),
  sendMsg: ()=> ipcRenderer.invoke('sendMsg'),
  getDebtors:()=> ipcRenderer.invoke('getDebtors'),
  getDateSends:()=>ipcRenderer.invoke('getDateSends'),
  getWs:()=>ipcRenderer.invoke('getWs'),
  updateExcCustomers:(excC)=> ipcRenderer.invoke('updateExcCustomers',excC)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld("electronAPI", {
});
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
