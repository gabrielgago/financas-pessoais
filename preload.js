const { contextBridge, ipcRenderer } = require('electron');

// Expor apenas as funções necessárias ao renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    getAllTransacoes: () => ipcRenderer.invoke('get-all-transacoes'),
    createTransacao: (transacao) => ipcRenderer.invoke('create-transacao', transacao),
    deleteTransacao: (id) => ipcRenderer.invoke('delete-transacao', id),
    pagarTransacao: (id) => ipcRenderer.invoke('pagar-transacao', id),
    alterarVencimento: (id, data_alterada) => ipcRenderer.invoke('alterar-vencimento-transacao', id, data_alterada),
    alterarStatus: (id, status) => ipcRenderer.invoke('alterar-status-transacao', id, status),
});
