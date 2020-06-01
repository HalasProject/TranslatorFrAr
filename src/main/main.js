const {app,ipcMain,Notification} = require("electron");
const { MainWindow, AddWindow,loadingWindow } = require("./window");
require('dotenv').config()

class Dictionaire{
  constructor() {
    this.mainWindow = null;
    this.addWindow = null;
    this.loadingWindow = null;
  }

  init() {
    
    app.whenReady().then(() => {
      this.loadingWindow = loadingWindow()
      this.createMainWindow();
    });

    ipcMain.on("maximize-app", () => {
      if (this.mainWindow.fullScreen) {
        this.mainWindow.fullScreen = false;
      } else {
       this.mainWindow.fullScreen = true;
      }
    });

    ipcMain.on('notification',(event,msg)=>{
      var notif = new Notification({
        icon:`${__dirname}/../assets/icon.png`,
        title:process.env.APP_NAME,
        body:`${msg.message}`
      })
      if (msg.type == 'word-added'){
        notif.on('click',()=>{
          console.log('type word-added')
          this.mainWindow.webContents.send('show-word',msg.id)
          this.mainWindow.focus()
        })
      }
      notif.show()
    })

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
      this.loadingWindow.destroy()
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
