const electron = require('electron');
const validators = require('../js/validators');

const { ipcRenderer } = electron;
const form = document.querySelector('form');
function validateWebsite(website) {
  return /^[a-z0-9]+[:.][a-z0-9]{0,4}[A-Za-z0-9\-._~:/?#[\]@!$&'()+,;=]*$/.test(website);
}

function checkIfHTTPisOnBegin(website) {
  return /^https?:/.test(website);
}
function submitForm(e) {
  e.preventDefault(); // default is saving to file
  const website = document.querySelector('#website').value;
  console.log(validators.isValidAddress(website));
  if (checkIfHTTPisOnBegin(website)) {
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
