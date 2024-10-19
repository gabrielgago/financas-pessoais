const { contextBridge, ipcRenderer } = require('electron');

// Expor apenas as funções necessárias ao renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getAllTransacoes: () => ipcRenderer.invoke('get-all-transacoes'),
    createTransacao: (transacao) => ipcRenderer.invoke('create-transacao'),
    deleteTransacao: (id) => ipcRenderer.invoke('delete-transacao', id)
});
