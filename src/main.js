const electron = require('electron');
const url = require('url');
const path = require('path');
const dns = require('dns');


const {
  app, BrowserWindow, Menu, Tray, ipcMain,
} = electron;
let mainWindow;
let addNewSiteWindow;
let setTimeWindow;
let noConnectionWindow;
const iconpath = path.join(`${__dirname}/icon.png`);
// process.env.NODE_ENV='production';


function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: iconpath,
  });
  // Load html file into window

  // Quit add when closed
  mainWindow.on('closed', () => {
    app.quit();
  });
  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });
}

function createSetTimeWindow() {
  // create new window
  setTimeWindow = new BrowserWindow({
    width: 300,
    height: 250,
    minWidth: 300,
    minHeight: 250,
    title: 'Set time',
  });
  // Load html file into window
  setTimeWindow.loadURL(url.format({ // FANCY
    pathname: path.join(__dirname, './html/setTimeWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Garbage collection handle
  setTimeWindow.on('close', () => {
    setTimeWindow = null;
  });
}
function createAddNewSiteWindow() {
  // create new window
  addNewSiteWindow = new BrowserWindow({
    width: 300,
    height: 250,
    minWidth: 300,
    minHeight: 250,
    title: 'Add new Site',
  });
  // Load html file into window
  addNewSiteWindow.loadURL(url.format({ // FANCY
    pathname: path.join(__dirname, './html/addNewSiteWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Garbage collection handle
  addNewSiteWindow.on('close', () => {
    addNewSiteWindow = null;
  });
}
function createNoConnectionWindow() {
  // create new window
  noConnectionWindow = new BrowserWindow({
    width: 300,
    height: 180,
    minWidth: 300,
    minHeight: 180,
    title: 'Connection Problem',
  });
  // Load html file into window
  noConnectionWindow.loadURL(url.format({ // FANCY
    pathname: path.join(__dirname, './html/noConnectionWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Garbage collection handle
  noConnectionWindow.on('close', () => {
    noConnectionWindow = null;
  });
}
const mainMenuTemplate = [
  {
    label: 'Options',
    submenu: [

      {
        label: 'Set time',
        enabled: true,
        click() {
          createSetTimeWindow();
        },
      },
      {
        label: 'Add new site',
        enabled: true,
        click() {
          createAddNewSiteWindow();
        },
      },
      {
        label: 'Delete all sites',
        enabled: true,
        click() {
          mainWindow.webContents.send('item:clear');
        },
      },
      {
        label: 'Quit',
        enabled: true,
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q', // MAC
        click() {
          app.quit();
        },
      },
    ],


  },
];
// Create main window
function showMainContent() {
  mainWindow.loadURL(url.format({ // FANCY
    pathname: path.join(__dirname, 'html/mainWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));
}

function makeMenuItemsDisabled() {
  Object.keys(mainMenuTemplate[0].submenu).forEach((key) => {
    mainMenuTemplate[0].submenu[key].enabled = false;
  });
}

function showLoadingContent() {
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/loadingWindow.html'),
    protocol: 'file:',
    slashes: true,

  }));
}

// Listen for app to be ready
app.on('ready', () => {
  createMainWindow();
  showLoadingContent();
  dns.lookup('google.com', (err) => {
    if (err) {
      createNoConnectionWindow();
      makeMenuItemsDisabled();
    } else {
      showMainContent();
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenuTemplate));
  });


  const appIcon = new Tray(iconpath);


  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click() {
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click() {
        app.isQuiting = true;
        app.quit();
      },
    },
  ]);


  appIcon.setContextMenu(contextMenu);
});


// Catch website:add
ipcMain.on('website:add', (e, website) => {
  mainWindow.webContents.send('website:add', website);
  addNewSiteWindow.close();
});

ipcMain.on('time:add', (e, time) => {
  mainWindow.webContents.send('time:add', time);
  setTimeWindow.close();
});

ipcMain.on('error:add', () => {
  app.quit();
});


if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform === 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      {
        role: 'reload',
      },
    ],
  });
}
