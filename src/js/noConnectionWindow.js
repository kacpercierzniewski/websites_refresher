const electron = require('electron');

const { ipcRenderer } = electron;

const form = document.querySelector('form');
function submitForm(e) {
  e.preventDefault(); // default is saving to file
  ipcRenderer.send('error:add');
}

form.addEventListener('submit', submitForm);
