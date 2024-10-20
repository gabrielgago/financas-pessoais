// main.js
const {app, BrowserWindow, Tray, Menu, ipcMain} = require('electron');
const path = require('path');
const knex = require('knex')(require('./knexfile').development);
const cron = require('node-cron');
const TransacaoRepository = require('./repository/TransacaoRepository');
const {atualizarStatusVencidos} = require('./services/TransacaoService');

const transacaoRepository = new TransacaoRepository();

// Agendar a verificação diária às 00:00 (meia-noite)
cron.schedule('0 0 * * *', () => {
    console.log('Verificando status de vencimento...');
    // Chamar a função para atualizar o status de vencidos
    atualizarStatusVencidos();
});

async function runMigrations() {
    try {
        await knex.migrate.latest();
        console.log('Migrations aplicadas com sucesso!');
    } catch (error) {
        console.error('Erro ao aplicar migrations:', error);
    }
}

runMigrations();
atualizarStatusVencidos();

// Incluir o electron-reload para fazer hot reload
require('electron-reload')(path.join(__dirname), {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    ignored: /node_modules|[/\\]\.|docker/ // Ignorar arquivos desnecessários
    // ignored: /node_modules|[/\\]\./ // Ignorar arquivos desnecessários
});


let mainWindow;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Caminho para o preload script
            contextIsolation: true, // Habilitar o isolamento de contexto para segurança
            nodeIntegration: false // Desativar a integração total com Node.js
        },
    });

    // Abre a janela maximizada
    mainWindow.maximize();

    mainWindow.loadFile('./view/index.html');

    // Oculta a janela ao invés de fechar
    mainWindow.on('close', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });

    // Mostra a janela ao clicar no ícone do tray
    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });
}

app.on('ready', () => {
    createWindow();

    // Criar um ícone na System Tray
    tray = new Tray('icons/talking.png');  // Caminho para seu ícone personalizado (ícone de tamanho 16x16 ou 32x32 é recomendável)
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Mostrar Aplicativo', click: () => mainWindow.show()},
        {
            label: 'Fechar', click: () => {
                mainWindow.destroy();
                app.quit();
            }
        },
    ]);

    tray.setToolTip('Talking');
    tray.setContextMenu(contextMenu);

    // Clicar no ícone do tray mostra a janela
    tray.on('click', () => {
        mainWindow.show();
    });
});

app.on('window-all-closed', () => {
    // No Windows ou Linux, o app fecha completamente ao fechar todas as janelas
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // No macOS, recriar janela se a barra do dock for clicada
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('get-all-transacoes', async () => {
    try {
        return await transacaoRepository.findAll();
    } catch (error) {
        console.error('Erro ao obter transações:', error);
        return [];
    }
});

ipcMain.handle('create-transacao', async (event, transacao) => {
    try {
        await transacaoRepository.create(transacao);
        return {success: true};
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        return {success: false, error: error.message};
    }
});

ipcMain.handle('pagar-transacao', async (event, transacao) => {
    return await transacaoRepository.pagar(transacao);
});

ipcMain.handle('alterar-vencimento-transacao', async (event, id, newVencimento) => {
    return await transacaoRepository.alterarVencimento(id, newVencimento);
});

ipcMain.handle('alterar-status-transacao', async (event, id, status) => {
    return await transacaoRepository.atualizarStatus(id, status);
});

ipcMain.handle('delete-transacao', async (event, id) => {
    try {
        return await transacaoRepository.delete(id);
    } catch (error) {
        console.error('Erro ao deletar transacao:', error);
        throw error;
    }
});
