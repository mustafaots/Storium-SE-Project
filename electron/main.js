const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const isDev = !app.isPackaged;

    if (isDev) {
        // In development, load from the Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
        console.log('Running in development mode: Loading from localhost:5173');
    } else {
        // In production, load the built index.html
        const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
        mainWindow.loadFile(indexPath).catch(err => {
            console.error("Failed to load frontend:", err);
        });
        console.log('Running in production mode: Loading from file system');
    }

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    const isDev = !app.isPackaged;

    // Only spawn backend in production (packaged) mode.
    // In development, we expect the backend to be running separately (e.g. via 'npm run dev').
    if (!isDev) {
        // Backend is copied to resources/backend via extraResources
        const backendPath = path.join(process.resourcesPath, 'backend');
        console.log("Starting backend from:", backendPath);

        backendProcess = spawn("node", ["server.js"], {
            cwd: backendPath,
            stdio: "inherit",
            env: process.env
        });

        backendProcess.on("error", (err) => {
            console.error("Failed to start backend:", err);
        });
    } else {
        console.log('Development mode: Skipping backend spawn (assume running externally)');
    }

    createWindow();
});

app.on("window-all-closed", () => {
    if (backendProcess) backendProcess.kill();
    if (process.platform !== "darwin") app.quit();
});
