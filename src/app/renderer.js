/* const { contexBridge , ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld( 'iocRenderer' , {
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    removeAllListeners : (channel) => ipcRenderer.removeAllListeners(channel)
}); */