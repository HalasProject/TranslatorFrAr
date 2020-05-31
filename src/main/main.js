const {app,ipcMain,webContents} = require("electron");
const { MainWindow, AddWindow } = require("./window");


class Dictionaire{
  constructor() {
    this.mainWindow = null;
    this.addWindow = null;
  }

  init() {
    
    app.whenReady().then(() => {
      this.createMainWindow();
    });

    ipcMain.on("maximize-app", () => {
      if (this.mainWindow.fullScreen) {
        this.mainWindow.fullScreen = false;
      } else {
       this.mainWindow.fullScreen = true;
      }
    });

    ipcMain.on("close-app", () => {
      app.quit();
    });

    ipcMain.on("show-addWord", (event, message) => {
      this.createAddWindow()
    });

    ipcMain.on("word-added", (event, message) => {
      this.mainWindow.webContents.send("new-word-added", message);
    });
  }

  createMainWindow() {
    this.mainWindow = MainWindow();
    this.mainWindow.webContents.on("did-finish-load", () => {
      this.mainWindow.show();
    });
  }

  createAddWindow(){
    this.addWindow = AddWindow();
    this.addWindow.webContents.on("did-frame-finish-load", () => {
      this.addWindow.show();
    });

    this.addWindow.on('closed',()=>{
      this.addWindow = undefined;
    })
  }
}

new Dictionaire().init()
