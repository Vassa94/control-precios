const { exec } = require('child_process');

// Ejecutar ng serve en segundo plano
exec('ng serve', (err, stdout, stderr) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log(stdout);
});
const { app, BrowserWindow } = require('electron')
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1366,
        height: 768,
        maximized: true,
    })

    win.loadURL('http://localhost:4200/productos')
}
app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})