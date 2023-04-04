const { app,BrowserWindow } = require('electron');


let appWin;

createWindow = () => {
    appWin = new BrowserWindow({
        width: 1366,
        height: 768,
        title: "Control de precios",
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#212529',
            symbolColor: '#ffff',
            height: 20
        },
        webPreferences: {
            preload: `${app.getAppPath()}/preload.js`,
            webSecurity: false
        }
    });

    appWin.once('ready-to-show', () => {
        appWin.maximize() // maximiza la ventana principal
        appWin.show()
    })


    appWin.loadURL(`file://${__dirname}/dist/index.html`);

    //appWin.setMenu(null);

    appWin.on('closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    })

}






