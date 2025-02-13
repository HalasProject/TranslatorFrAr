const { BrowserWindow } = require("electron");

const views_path = `${__dirname}/../renderer/views`;
const assets_path = `${__dirname}/../assets`;


exports.MainWindow = function () {
  let window = new BrowserWindow({
    minWidth:820,
    width: 1000,
    height: 700,
    frame:false,
    show:false,
    center: true,
    icon: `${assets_path}/icon.png`,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadFile(`${views_path}/index.html`);
  return window;
};

exports.AddWindow = function (parent) {
  let window = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 800,
    frame:false,
    minHeight: 600,
    show: false,
    icon: `${assets_path}/icon.png`,
    parent: parent,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  window.loadFile(`${views_path}/adding.html`);
  return window;
};

exports.loadingWindow = function(){
  let window = new BrowserWindow({
    minWidth:500,
    closable:false,
    hasShadow:true,
    fullscreenable:false,
    autoHideMenuBar:true,
    movable:false,
    maximizable:false,
    minimizable:false,
    resizable:false,
    minHeight:500,
    width: 1000,
    height: 700,
    frame:false,
    transparent:true,
    show:true,
    center: true,
  });
  window.loadFile(`${views_path}/loading.html`);
  return window;
}
