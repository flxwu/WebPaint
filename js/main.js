let drawing = [];
let tmpDrawing = [];
let path = [];

let doodlesDict = [];

let database;
let loadedDoodleEdited = false;

let doodleKey = '';

let loaddialog;

let USER_MSG = {
  UPLOAD_SUCCESS: 'Doodle saved successfully',
  UPLOAD_SUCCESS_SUB: 'Your Doodle has been successfully ' +
    'uploaded to the WebPaint database! Key: ',
  UPLOAD_ERROR: '[ERROR] Doodle saving failed',
  UPLOAD_ERROR_SUB: 'Uploading your Doodle has failed due to this',
  UPLOAD_ERROR_DUPLICATE: 'You cannot save the exact same doodle twice',
  DOWNLOAD_SUCCESS: 'Doodle downloaded successfully',
  DOWNLOAD_SUCCESS_SUB: 'Saved as: ',
  DOWNLOAD_ERROR: '[ERROR] Doodle download failed',
  CANVAS_EMPTY: 'Canvas is empty',
  CANVAS_CLEARED: 'Canvas cleared successfully',
  LOAD_SUCCESS: 'Doodles loaded successfully',
  LOAD_SUCCESS_SUB: 'Saved Doodles have been successfully ' +
    'fetched and loaded from WebPaint database!',
};

/*
  P5.JS Functions
*/

/**
 * Setup Database and create canvas
 */
function setup() {
  // Start Firebase
  let config = {
    apiKey: 'AIzaSyDSspuE2xGloHo-mEtLKRLbYGU8VkssNPk',
    authDomain: 'webpaint-p5js.firebaseapp.com',
    databaseURL: 'https://webpaint-p5js.firebaseio.com',
    projectId: 'webpaint-p5js',
    storageBucket: '',
    messagingSenderId: '177158416431',
  };
  firebase.initializeApp(config);
  database = firebase.database();

  let canvas = createCanvas(document.body.clientWidth - 200,
    window.innerHeight - 200);

  canvas.mousePressed(startLine);
  canvas.parent('canvas');
}

function mouseDragged() {
  if (loaddialog != null) {
    if (!loaddialog.hasAttribute('open')) {
      let p = {
        x: mouseX,
        y: mouseY,
      };
      // push to mouseDragged path
      path.push(p);
      loadedDoodleEdited = true;
    }
  } else {
    let p = {
      x: mouseX,
      y: mouseY,
    };
    // push to mouseDragged path
    path.push(p);
    loadedDoodleEdited = true;
  }
}

function draw() {
  background(0);

  stroke(255);
  strokeWeight(4);
  noFill();
  // draw current doodle
  drawing.forEach((path) => {
    beginShape();
    path.forEach((point) => {
      vertex(point.x, point.y);
    });
    endShape();
  });
}

function windowResized() {
  resizeCanvas(document.body.clientWidth - 200, window.innerHeight - 200);
}

/*
  Helper Functions
*/

// onMouseDown
const startLine = () => {
  path = [];
  // add previous mouseDragged path to doodle
  drawing.push(path);
};

/* button clicks */
const onSaveDoodle = () => {
  if (drawing.length == tmpDrawing.length && drawing.every((v, i) => v === tmpDrawing[i]) || loadedDoodleEdited) {
    notify(USER_MSG.UPLOAD_ERROR, USER_MSG.UPLOAD_ERROR_DUPLICATE);
  } else {
    pushDoodleToFirebase();
  }
};

const onLoadDoodle = () => {
  loaddialog = document.querySelector('#loaddialog');
  let closebutton = document.querySelector('#close-dialog'),
    pagebackground = document.querySelector('body');

  if (!loaddialog.hasAttribute('open')) {
    // get doodles from db
    fetchDoodles();
    // show the dialog
    loaddialog.setAttribute('open', 'open');
    // after displaying the dialog, focus the closebutton inside it
    closebutton.focus();
    closebutton.addEventListener('click', onLoadDoodle);
  } else {
    loaddialog.removeAttribute('open');
  }
};

// clear drawing array -> clear canvas
const onClearDoodle = () => {
  drawing = [];
  notify(USER_MSG.CANVAS_CLEARED, '');
};

// download current canvas to local
const onDownloadDoodle = () => {
  if (drawing.length == 0) {
    notify(USER_MSG.DOWNLOAD_ERROR, USER_MSG.CANVAS_EMPTY);
  } else {
    if (doodleKey == '') {
      let currTime = String(new Date(new Date().getTime()).toISOString().split('.')[0]);
      let fileName = 'WebPaint_' + currTime;
      saveCanvas(fileName, 'jpg');
      notify(USER_MSG.DOWNLOAD_SUCCESS, USER_MSG.DOWNLOAD_SUCCESS_SUB + fileName);
    } else {
      let fileName = 'WebPaint_' + String(doodleKey);
      saveCanvas(fileName, 'jpg');
      notify(USER_MSG.DOWNLOAD_SUCCESS, USER_MSG.DOWNLOAD_SUCCESS_SUB + fileName);
    }
  }
};

// push current drawing[] to db
const pushDoodleToFirebase = () => {
  let dbDrawings = database.ref('drawings');

  // data to be stored in DB
  let data = {
    doodle: drawing,
  };

  let dbDoodle = dbDrawings.push(data, finished);
  console.log('Firebase generated key: ' + dbDoodle.key);
  doodleKey = dbDoodle.key;

  // Reload the data for the page
  function finished(err) {
    if (err) {
      console.log('ooops, something went wrong.');
      console.log(err);
      notify(USER_MSG.UPLOAD_ERROR, USER_MSG.UPLOAD_ERROR_SUB);
    } else {
      console.log(USER_MSG.UPLOAD_SUCCESS);
      notify(USER_MSG.UPLOAD_SUCCESS, USER_MSG.UPLOAD_SUCCESS_SUB + String(doodleKey));
      tmpDrawing = drawing;
    }
  }
};

// Notifications
const notify = (title, msg) => {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission();
  } else {
    let notification = new Notification(title, {
      icon: 'favicon.ico',
      body: msg,
    });

    notification.onclick = function () {
      window.open('https://webpaint.david-wu.me/');
    };
  }
};

// load doodles from DB into list
const fetchDoodles = () => {
  console.log('Loading from db');
  getAllDoodles();
  showLoadedDoodles();
};

// get all doodle IDs and add them to doodlesDict
const getAllDoodles = () => {
  let ref = database.ref('drawings');
  ref.on('value', gotAll, errData);
  // The data comes back as an object

  function gotAll(data) {
    let drawings = data.val();
    // Grab all the keys to iterate over the object
    doodlesDict = [];
    let keys = Object.keys(drawings);
    for (let i = 0; i < keys.length; i++) {
      // let oneDoodle = loadOne(keys[i]);
      // console.log(oneDoodle);
      doodlesDict.push({
        key: keys[i],
        // value: oneDoodle
      });
    }
  }

  function errData(error) {
    console.log('Something went wrong.');
    console.log(error);
  }
};

const loadOne = (id) => {
  let ref = database.ref('drawings/' + id);
  ref.on('value', gotOne, errData);

  function errData(error) {
    console.log('Something went wrong.');
    console.log(error);
  }

  function gotOne(data) {
    drawing = data.val().doodle;
    loadedDoodleEdited = false;
  }
};

const showLoadedDoodles = () => {
  let doodleTable = document.querySelector('table').getElementsByTagName('tbody')[0];
  doodleTable.innerHTML = '';
  Object.entries(doodlesDict).forEach((doodleEntry) => {
    let row = doodleTable.insertRow(-1);
    let cell_ID = row.insertCell(0);
    let cell_Key = row.insertCell(1);
    cell_ID.innerHTML = doodleEntry[0];
    cell_Key.innerHTML = doodleEntry[1].key;
    let createClickHandler =
      function (row) {
        return function () {
          let IDcell = row.getElementsByTagName('td')[1];
          let doodleID = IDcell.innerHTML;
          loadOne(doodleID);
          loaddialog.removeAttribute('open');
        };
      };
    row.onclick = createClickHandler(row);
  });
};