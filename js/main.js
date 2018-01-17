var drawing=[];
var isDrawing=false;
var mousedownDraw=[];
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
  var canvas = createCanvas(500,500);
  canvas.mousePressed(startLine);
  canvas.parent('canvas');

}

function draw() {
  background(0);

  if(mouseIsPressed) {
      var point = {
        x: mouseX,
        y: mouseY
      }
      mousedownDraw.push(point);
  } else {
    drawing.push(mousedownDraw);
    mouseDownDraw=[];
  }

  beginShape();

  stroke(255);
  strokeWeight(4);
  noFill();
  mousedownDraw.forEach(point => {
    vertex(point.x,point.y);
  });
  drawing.forEach(line =>
    line.forEach(point => {
      vertex(point.x,point.y);
    })
  );
  endShape();
}

const startLine = () => {
  
}
