const { app, BrowserWindow } = require('electron');

let appWin;

createWindow = () => {
    appWin = new BrowserWindow({
        width: 1366,
        height: 768,
        title: "Control de precios",
        webPreferences: {
            preload: `${app.getAppPath()}/preload.js`,
            webSecurity: false
        }
    });

    appWin.loadURL(`file://${__dirname}/dist/index.html`);

    //appWin.setMenu(null);

    appWin.on('closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    })

}

app.on('ready', createWindow);

app.on('window-all-closed', () => appWin.quit());


