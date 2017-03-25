const electron = require('electron'),
server = require("./server");
// Module to control application life.
const appE = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const {ipcMain} = require('electron')

const path = require('path')
const url = require('url')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let remoteWindow;
  let child;
var saveDime;
var linkRemote;
const Menu = electron.Menu;
const shell = require("electron").shell;

appE.on('ready', function () {


   const menuTemplate = [
   {
       label: 'Electron',
       submenu: [
           {
               label: 'About ...',
               click: () => {
                   shell.openExternal('https://github.com/joZephhh/Raino')
               }
           },
           {
               label: 'Quit',
               role: 'quit'
           }
       ]
   },
   {
       label: 'DevTools',
       submenu: [
           {
               label: 'Open',
              click() {mainWindow.openDevTools()}
           }
       ]
   }

];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
});
function createWindow () {
    const {session} = require('electron')
    const ses = session.fromPartition('persist:name')
  // Create the browser window.
  ipcMain.on('open-remote', (event, link) => {
      console.log(link)
    remoteWindow = new BrowserWindow({
        width: 400,
        height: 550,
        frame: false,
        resize:false,
        titleBarStyle : 'hidden-inset'
    })
    remoteWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'assets/views/remote_connect.html'),
      protocol: 'file:',
      slashes: true
    }))
linkRemote=link;
  })
ipcMain.on('remote-init-ask', (event) => {
event.sender.send('remote-init-answer', linkRemote)
})


 ipcMain.on('close-remote-win', (event, link) => {
         remoteWindow.webContents.send("remoteIsConnected");

 })

  mainWindow = new BrowserWindow({
      width: 1027,
      title:"Raino",
      minWidth:600,
      minHeight:600,
      height: 578,
      frame: false,
      center:true,
      icon: '/icon/play-button.icns',
       titleBarStyle : 'hidden-inset'})


mainWindow.setAspectRatio(1.7777777778)
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))


  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow.on('enter-full-screen', function(){
    mainWindow.setAspectRatio(0);

     });

     mainWindow.on('leave-full-screen', function(){

        mainWindow.setAspectRatio(1.7777777778);

        });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
appE.on('ready', createWindow)

// Quit when all windows are closed.
appE.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    appE.quit()
  }
})

appE.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
