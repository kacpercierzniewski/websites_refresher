const electron = require('electron');
const axios = require('axios');
const fs = require('fs');
const openurl = require('openurl');
const Store = require('electron-store');
const path = require('path');
const url = require('url');
const Console = require('console');

const Window = electron.remote.BrowserWindow;
let addNewSiteWindow;
const store = new Store();
const { ipcRenderer, shell } = electron;

const ul = document.querySelector('ul');
const dir = `${__dirname}/websites/`;
let time;


function checkForTimeVariable() {
  if (!store.has('time')) {
    document.querySelector('#time').textContent = 'Default time settings (60 seconds)';
    store.set('time', 60);
  } else {
    document.querySelector('#time').textContent = `Refreshing sites every ${store.get('time')} seconds`;
    time = store.get('time');
  }
}

function checkIfFolderExists() {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

function setDefaultLook(websiteItem) {
  const websiteDiv = document.querySelector(`#website${websiteItem.id}`);
  const collapsibleBody = document.querySelector(`#collapsible${websiteItem.id}`);
  websiteDiv.childNodes[2].innerHTML = 'No changes';
  collapsibleBody.childNodes[0].innerHTML = 'No changes detected';
}

function setTime(newTime) {
  store.set('time', newTime);
  document.querySelector('#time').textContent = `Refreshing sites every ${store.get('time')} seconds`;
  time = store.get('time');
}


function saveWebsiteToHTML(websiteItem) {
  const file = fs.createWriteStream(`${dir + websiteItem.id}.html`);
  file.write(websiteItem.newContent);
}
function setSiteUnchanged() {
  const websiteItem = store.get(`${this.childNodes[0].className}`);
  setDefaultLook(websiteItem);
  saveWebsiteToHTML(websiteItem);
}
function showNotification(websiteItem) {
  const myNotification = new Notification(`Changes on ${websiteItem.url}`, {
    body: 'Click "View" to check that site!',

  });
  myNotification.onclick = () => {
    openurl.open(`http://${websiteItem.url}`);
    setDefaultLook(websiteItem);
    saveWebsiteToHTML(websiteItem);
  };
}
function showChanges(websiteItem) {
  const websiteDiv = document.querySelector(`#website${websiteItem.id}`);
  const collapsibleBody = document.querySelector(`#collapsible${websiteItem.id}`);
  websiteDiv.childNodes[2].innerHTML = "<i class='fas fa-2x fa-exclamation-circle' style='color:green'></i>";
  collapsibleBody.childNodes[0].innerHTML = `<a href='http://${websiteItem.url}' class='${websiteItem.id}'>Click here to enter website!</a>`;
  collapsibleBody.childNodes[0].addEventListener('click', setSiteUnchanged);
  showNotification(websiteItem);
}
function showError(idOfWebsite) {
  const websiteDiv = document.querySelector(`#website${idOfWebsite}`);
  const collapsibleBody = document.querySelector(`#collapsible${idOfWebsite}`);
  websiteDiv.childNodes[2].innerHTML = "<i class='fas fa-2x fa-exclamation-triangle' style='color:red'></i>";
  collapsibleBody.childNodes[0].textContent = 'Could not download website, propably site is down.';
}

function compareSites(oldSiteItem, newSite) {
  fs.readFile(`${dir + oldSiteItem.id}.html`, (err, data) => {
    if (err) {
      return err;
    }
    if (data.toString() === newSite.toString()) {
      Console.log('sites the same');

      if (oldSiteItem.status === 'changed' || oldSiteItem.status === 'down') {
        setDefaultLook(oldSiteItem);
        store.set(`${oldSiteItem.id}.status`, 'unchanged');
      }
    } else if (oldSiteItem.status === 'unchanged' || oldSiteItem.status === 'down') {
      Console.log('different sites');
      store.set(`${oldSiteItem.id}.status`, 'changed');
      showChanges(oldSiteItem);
    }
    return 0; // eslint is telling, that it's needed to return something when using arrow function
  });
}


function manageWebsiteContent(websiteItem) {
  if (websiteItem != null) {
    axios.get(`http://${websiteItem.url}`)
      .then((response) => {
        if (response.status === 200) {
          if (`${websiteItem.status}` === 'new') {
            store.set(`${websiteItem.id}.newContent`, response.data);
            saveWebsiteToHTML(store.get(`${websiteItem.id}`));
            store.set(`${websiteItem.id}.status`, 'unchanged');
          } else {
            store.set(`${websiteItem.id}.newContent`, response.data);
            compareSites(websiteItem, response.data);
          }
          setTimeout(() => {
            manageWebsiteContent(store.get(`${websiteItem.id}`));
          }, store.get('time') * 1000);
        }
      }, (error) => {
        store.set(`${websiteItem.id}.status`, 'down');

        setTimeout(() => {
          manageWebsiteContent(store.get(`${websiteItem.id}`));
        }, store.get('time') * 1000);
        showError(websiteItem.id);
        return error;
      });
  }
}


// Remove one site
function removeItem() {
  const li = this.parentNode.parentNode;
  const websiteName = li.childNodes.item(0).childNodes.item(1).textContent;
  li.parentNode.removeChild(li);
  Object.keys(store.store).forEach((key) => {
    if (store.store[key].url === websiteName) {
      store.delete(key);
    }
    store.delete();
  });
}

function addNewSite(websiteItem) {
  ul.className = 'collapsible';
  const li = document.createElement('li');
  const div = document.createElement('div');
  const icon = document.createElement('i');
  const websiteName = document.createElement('div');
  const span = document.createElement('span');
  const removeItemBtn = document.createElement('a');
  const collapsibleBody = document.createElement('div');
  const collapsibleBodyText = document.createElement('span');

  div.className = 'collapsible-header';
  div.id = `website${websiteItem.id}`;
  icon.className = 'material-icons';
  icon.textContent = 'language';
  websiteName.textContent = websiteItem.url;
  span.className = 'badge';
  span.textContent = 'No changes';
  collapsibleBody.className = 'collapsible-body';
  collapsibleBody.id = `collapsible${websiteItem.id}`;
  collapsibleBodyText.textContent = 'No changes detected.';
  removeItemBtn.className = 'waves-effect waves-light btn';
  removeItemBtn.text = 'Remove item';
  removeItemBtn.style.cssFloat = 'right';
  removeItemBtn.style.marginTop = '0px';
  ul.appendChild(li);
  li.appendChild(div);
  div.appendChild(icon);
  div.appendChild(websiteName);
  div.appendChild(span);
  li.appendChild(collapsibleBody);
  collapsibleBody.appendChild(collapsibleBodyText);
  collapsibleBody.appendChild(removeItemBtn);

  if (websiteItem.status === 'changed') {
    showChanges(websiteItem);
  }
  removeItemBtn.addEventListener('click', removeItem);
}
function addItemsOnStart() {
  Object.keys(store.store).forEach((key) => {
    if (key !== 'time') {
      addNewSite(store.store[key]);
      manageWebsiteContent(store.store[key]);
    }
  });
}

function createAddNewSiteWindow() {
  // create new window
  addNewSiteWindow = new Window({
    width: 300,
    height: 250,
    minWidth: 300,
    minHeight: 250,
    title: 'Add new Site',
  });
  // Load html file into window
  addNewSiteWindow.loadURL(url.format({ // FANCY
    pathname: path.join(__dirname, './addNewSiteWindow.html'),
    protocol: 'file:',
    slashes: true,
  }));
  // Garbage collection handle
  addNewSiteWindow.on('close', () => {
    addNewSiteWindow = null;
  });
}
function addFunctionToButton() {
  const button = document.querySelector('#addNewSiteButton');
  button.onclick = createAddNewSiteWindow;
}
function initOperations() {
  checkIfFolderExists();
  addItemsOnStart();
  checkForTimeVariable();
  addFunctionToButton();
}
//  add new site
ipcRenderer.on('website:add', (e, item) => {
  for (let i = 0; i < store.size; i += 1) {
    if (!store.has(`${i}`)) {
      store.set(`${i}.url`, item);
      store.set(`${i}.status`, 'new');
      store.set(`${i}.id`, i);
      store.set(`${i}.newContent`, '');
      addNewSite(store.get(`${i}`));
      manageWebsiteContent(store.get(`${i}`));
      break;
    }
  }
});
// clear all sites
ipcRenderer.on('item:clear', () => {
  ul.innerHTML = '';
  ul.className = '';
  store.clear();
  store.set('time', time);
});
// set time
ipcRenderer.on('time:add', (e, item) => {
  setTime(item);
});

// Open all links in os browser

document.addEventListener('click', (event) => {
  if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
    event.preventDefault();
    shell.openExternal(event.target.href);
  }
});
initOperations();
