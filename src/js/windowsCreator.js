const path = require('path');
const url = require('url');
const electron = require('electron');

const Window = electron.remote.BrowserWindow;
module.exports = {
  createWindow(width, height, title, src) {
    // create new window
    let window = new Window({
      width,
      height,
      minWidth: width,
      minHeight: height,
      title,
    });
    // Load html file into window
    window.loadURL(url.format({ // FANCY
      pathname: path.join(__dirname, src),
      protocol: 'file:',
      slashes: true,
    }));
    // Garbage collection handle
    window.on('close', () => {
      window = null;
    });
  },

};
