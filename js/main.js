var drawing=[];
var path=[];
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

  var docCanvas=document.querySelector('#canvas');
  var canvas = createCanvas(document.body.clientWidth-200, window.innerHeight-250);

  canvas.mousePressed(startLine);
  canvas.parent('canvas');

}

const startLine = () => {
  path = [];
  drawing.push(path);
}

function mouseDragged() {
  var p = {
    x: mouseX,
    y: mouseY
  }
  path.push(p);
}

function draw() {
  background(0);


  stroke(255);
  strokeWeight(4);
  noFill();
  drawing.forEach(path => {
    beginShape();
    path.forEach(point => {
      vertex(point.x,point.y);
    });
    endShape();
  });
}
