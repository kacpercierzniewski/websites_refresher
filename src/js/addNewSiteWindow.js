const electron = require('electron');
const validators = require('../js/validators');

const { ipcRenderer } = electron;
const form = document.querySelector('form');

function submitForm(e) {
  e.preventDefault(); // default is saving to file
  const website = document.querySelector('#website').value;
  if (validators.checkIfHTTPisOnBegin(website)) {
    const pError = document.querySelector('#error');
    pError.textContent = 'Please enter website without http(s). ';
  } else if (validators.isValidAddress(website)) {
    ipcRenderer.send('website:add', website);
  } else {
    const pError = document.querySelector('#error');
    pError.textContent = 'Please enter valid website.';
  }
}
form.addEventListener('submit', submitForm);
