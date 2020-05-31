const {BrowserWindow} = require('electron')

const views_path = `${__dirname}/../renderer/views`
const assets_path = `${__dirname}/../assets`
exports.MainWindow = function() {
  let window = new BrowserWindow({
    width: 1000,
    height: 700,
    show:false,
    center: true,
    icon: `${assets_path}/icon.ico`,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: true,
    },
  });
  window.loadFile(`${views_path}/index.html`);
  return window;
}

exports.AddWindow = function(parent){
    let window = new BrowserWindow({
      show: true,
      width: 800,
      show:false,
      minWidth:800,
      minHeight:600,
      height: 600,
      icon:`${assets_path}/add.png`,
      parent: parent,
      webPreferences:{
        nodeIntegration:true
      },
    });
    window.loadFile(`${views_path}/adding.html`);
    return window
}
