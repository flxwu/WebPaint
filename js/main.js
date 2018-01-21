var drawing = [];
var path = [];
var listItems = [];

var database;

var doodleKey = '';

/* p5js functions */
function setup() {

  // Start Firebase
  var config = {
    apiKey: "AIzaSyDSspuE2xGloHo-mEtLKRLbYGU8VkssNPk",
    authDomain: "webpaint-p5js.firebaseapp.com",
    databaseURL: "https://webpaint-p5js.firebaseio.com",
    projectId: "webpaint-p5js",
    storageBucket: "",
    messagingSenderId: "177158416431"
  };
  firebase.initializeApp(config);
  database = firebase.database();

  var docCanvas = document.querySelector('#canvas');
  var canvas = createCanvas(document.body.clientWidth - 200, window.innerHeight - 200);

  canvas.mousePressed(startLine);
  canvas.parent('canvas');
}

function mouseDragged() {
  var p = {
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

/* helper functions */

// onMouseDown
const startLine = () => {
  path = [];
  // add previous mouseDragged path to doodle
  drawing.push(path);
}

// button clicks
const onSaveDoodle = () => {
    pushDoodleToFirebase();
}

const onClearDoodle = () => {
    drawing=[];
}

const onDownloadDoodle = () => {
    if(drawing.length==0) {

    } else {
      saveCanvas("WebPaint_"+String(doodleKey),"jpg");
    }
}

// push current drawing[] to db
const pushDoodleToFirebase = () => {
  var dbDrawings = database.ref('drawings');

  // data to be stored in DB
  var data = {
    doodle : drawing
  };

  var dbDoodle = dbDrawings.push(data, finished);
  console.log("Firebase generated key: " + dbDoodle.key);
  doodleKey = dbDoodle.key;

  // Reload the data for the page
  function finished(err) {
    if (err) {
      console.log("ooops, something went wrong.");
      console.log(err);
    } else {
      console.log('Data saved successfully');
    }
  }
}
