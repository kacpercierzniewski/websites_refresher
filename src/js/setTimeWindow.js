
const electron = require('electron');
const validators = require('../js/validators');

const { ipcRenderer } = electron;
const form = document.querySelector('form');
function submitForm(e) {
  e.preventDefault(); // default is saving to file
  const time = document.querySelector('#time').value;
  if (validators.isValidNumber(time)) {
    ipcRenderer.send('time:add', time);
  } else {
    document.querySelector('#error').innerHTML = 'Wrong time value, please set time above 10 seconds.';
  }
}
form.addEventListener('submit', submitForm);
