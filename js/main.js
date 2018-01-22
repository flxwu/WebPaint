var drawing = [];
var tmpDrawing = [];
var path = [];
var listItems = [];

var database;

var doodleKey = '';

const USER_MSG = {
  UPLOAD_SUCCESS: 'Doodle saved successfully',
  UPLOAD_SUCCESS_SUB: 'Your Doodle has been successfully uploaded to the WebPaint database! Key: ',
  UPLOAD_ERROR: '[ERROR] Doodle saving failed',
  UPLOAD_ERROR_SUB: 'Uploading your Doodle has failed due to this',
  UPLOAD_ERROR_DUPLICATE: 'You cannot save the exact same doodle twice',
  DOWNLOAD_SUCCESS: 'Doodle downloaded successfully',
  DOWNLOAD_SUCCESS_SUB: 'Saved as: ',
  DOWNLOAD_ERROR: '[ERROR] Doodle download failed',
  CANVAS_EMPTY: 'Canvas is empty',
  CANVAS_CLEARED: 'Canvas cleared successfully'
}

/*
  P5.JS Functions
*/

function setup() {

  // Start Firebase
  let config = {
    apiKey: "AIzaSyDSspuE2xGloHo-mEtLKRLbYGU8VkssNPk",
    authDomain: "webpaint-p5js.firebaseapp.com",
    databaseURL: "https://webpaint-p5js.firebaseio.com",
    projectId: "webpaint-p5js",
    storageBucket: "",
    messagingSenderId: "177158416431"
  };
  firebase.initializeApp(config);
  database = firebase.database();

  let docCanvas = document.querySelector('#canvas');
  let canvas = createCanvas(document.body.clientWidth - 200, window.innerHeight - 200);

  canvas.mousePressed(startLine);
  canvas.parent('canvas');
}

function mouseDragged() {
  let p = {
    x: mouseX,
    y: mouseY
  }
  // push to mouseDragged path
  path.push(p);
}

function draw() {
  background(0);

  stroke(255);
  strokeWeight(4);
  noFill();

  // draw current doodle
  drawing.forEach(path => {
    beginShape();
    path.forEach(point => {
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
}

/* button clicks */
const onSaveDoodle = () => {
  if (drawing.length == tmpDrawing.length && drawing.every((v, i) => v === tmpDrawing[i])) {
    notify(USER_MSG.UPLOAD_ERROR, USER_MSG.UPLOAD_ERROR_DUPLICATE);
  } else {
    pushDoodleToFirebase();
  }
}

const onLoadDoodle = () => {
  notify("[ERROR] Not implemented yet","Sorry for the inconvenience");
  // var dialog = document.querySelector('dialog'),
  //   closebutton = document.getElementById('close-dialog'),
  //   pagebackground = document.querySelector('body');

  // if (!dialog.hasAttribute('open')) {
  //   // show the dialog 
  //   dialog.setAttribute('open', 'open');
  //   // after displaying the dialog, focus the closebutton inside it
  //   closebutton.focus();
  //   closebutton.addEventListener('click', onLoadDoodle);
  // } else {
  //   dialog.removeAttribute('open');
  //   var div = document.querySelector('#backdrop');
  // }
}

const onClearDoodle = () => {
  drawing = [];
  notify(USER_MSG.CANVAS_CLEARED, '');
}

const onDownloadDoodle = () => {
  if (drawing.length == 0) {
    notify(USER_MSG.DOWNLOAD_ERROR, USER_MSG.CANVAS_EMPTY);
  } else {
    if (doodleKey == '') {
      let currTime = String(new Date(new Date().getTime()).toISOString().split('.')[0]);
      let fileName = "WebPaint_" + currTime;
      saveCanvas(fileName, "jpg");
      notify(USER_MSG.DOWNLOAD_SUCCESS, USER_MSG.DOWNLOAD_SUCCESS_SUB + fileName);
    } else {
      let fileName = "WebPaint_" + String(doodleKey);
      saveCanvas(fileName, "jpg");
      notify(USER_MSG.DOWNLOAD_SUCCESS, USER_MSG.DOWNLOAD_SUCCESS_SUB + fileName);
    }
  }
}

// push current drawing[] to db
const pushDoodleToFirebase = () => {
  let dbDrawings = database.ref('drawings');

  // data to be stored in DB
  let data = {
    doodle: drawing
  };

  let dbDoodle = dbDrawings.push(data, finished);
  console.log("Firebase generated key: " + dbDoodle.key);
  doodleKey = dbDoodle.key;

  // Reload the data for the page
  function finished(err) {
    if (err) {
      console.log("ooops, something went wrong.");
      console.log(err);
      notify(USER_MSG.UPLOAD_ERROR, USER_MSG.UPLOAD_ERROR_SUB);
    } else {
      console.log(USER_MSG.UPLOAD_SUCCESS);
      notify(USER_MSG.UPLOAD_SUCCESS, USER_MSG.UPLOAD_SUCCESS_SUB + String(doodleKey));
      tmpDrawing = drawing;
    }
  }
}

// Notifications
const notify = (title, msg) => {
  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  } else {
    let notification = new Notification(title, {
      icon: 'favicon.ico',
      body: msg,
    });

    notification.onclick = function () {
      window.open("https://webpaint.david-wu.me/");
    };

  }

}