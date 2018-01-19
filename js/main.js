var drawing = [];
var path = [];
var listItems = [];
var database;

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
  var canvas = createCanvas(document.body.clientWidth - 200, window.innerHeight - 250);

  canvas.mousePressed(startLine);
  canvas.parent('canvas');

}

const startLine = () => {
  path = [];
  // add previous mouseDragged path to doodle
  drawing.push(path);
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

const onSaveDoodle = () => {
  pushDoodleToFirebase();
}

const pushDoodleToFirebase = () => {
  var dbDrawings = database.ref('drawings');

  // data to be stored in DB
  var data = {
    doodle : drawing
  };

  var dbDoodle = dbDrawings.push(data, finished);
  console.log("Firebase generated key: " + dbDoodle.key);

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
