var fs = require('fs');
var brain = require('brain');
var convnetjs = require('convnetjs');

var dataFileBuffer  = fs.readFileSync(__dirname + '/data/train-images.idx3-ubyte');
var labelFileBuffer = fs.readFileSync(__dirname + '/data/train-labels.idx1-ubyte');
var pixelValues     = [];

var IMAGE_SIZE = 28;
var DATA_OFFSET = 16;

var LabeledDigit = function (image, label) {
  this.image = image;
  this.label = label;
};

var digits = [];

for (var i = 0; i < 60000; i++) {
    var image = [];
    for (var pos = 0; pos < IMAGE_SIZE * IMAGE_SIZE; ++pos) {
      image.push(dataFileBuffer[DATA_OFFSET + i * IMAGE_SIZE * IMAGE_SIZE + pos]);
    }
    digits.push(new LabeledDigit(image, labelFileBuffer[i + 8]));
//    i % 10000 == 0 && console.log(digits[digits.length - 1]);
}

var layer_defs = [];
layer_defs.push({type:'input', out_sx:24, out_sy:24, out_depth:1}); // declare size of input
// output Vol is of size 32x32x3 here
layer_defs.push({type:'conv', sx:5, filters:8, stride:1, pad:2, activation:'relu'});
// the layer will perform convolution with 16 kernels, each of size 5x5.
// the input will be padded with 2 pixels on all sides to make the output Vol of the same size
// output Vol will thus be 32x32x16 at this point
layer_defs.push({type:'pool', sx:2, stride:2});
// output Vol is of size 16x16x16 here
layer_defs.push({type:'conv', sx:5, filters:16, stride:1, pad:2, activation:'relu'});
// output Vol is of size 16x16x20 here
layer_defs.push({type:'pool', sx:3, stride:3});
// output Vol is of size 8x8x20 here
layer_defs.push({type:'softmax', num_classes:10});
// output Vol is of size 1x1x10 here

net = new convnetjs.Net();
net.makeLayers(layer_defs);

var trainer = new convnetjs.SGDTrainer(net, {method: 'adadelta', l2_decay: 0.001,
                                    batch_size: 20});

console.log('training network...');
digits.slice(0, 60000).forEach(function (digit, index) {
  var vol = new convnetjs.Vol(IMAGE_SIZE, IMAGE_SIZE, 1);
  vol.w = digit.image;
  var res = trainer.train(vol, digit.label);
  index % 1000 == 0 && console.log('trained ' + index + ' images');
  index % 1000 == 0 && console.log(res);
});
console.log('training is done.');
console.log(trainer.train(new convnetjs.Vol(digits[0].image), digits[0].label));

// var res = net.forward(new convnetjs.Vol(digits[0].image));
// console.log(res);
// console.log(digits[0].label);
for (var i = 0; i < 20; ++i) {
  console.log('expected: ' + digits[i].label);
  var vol = new convnetjs.Vol(IMAGE_SIZE, IMAGE_SIZE, 1);
  vol.w = digits[i].image;
  var res = net.forward(vol);
  for (var j = 0; j < 10; ++j) {
    console.log(res.w[j]);
  }
}
for (var i = 0; i < IMAGE_SIZE; ++i) {
  for (var j = 0; j < IMAGE_SIZE; ++j) {
    var idx = IMAGE_SIZE * i + j;
    process.stdout.write((digits[0].image[idx] >= 128 ? 1 : 0) + '');
//    process.stdout.write('' + digits[0].image[idx]);
  }
  console.log('');
}


var express = require('express');
var bodyParser = require('body-parser');
var gm = require('gm');
var PNG = require('pngjs').PNG;

var app = express();
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.post('/recognize', function (req, res) {
  console.log('processing Recognize request...');
  var dataUrl = req.body.image;
  dataUrl = dataUrl.replace("data:image/png;base64,", "");
  console.log(dataUrl);
  var img = new Buffer(dataUrl, 'base64');
  gm(img).resize(28, 28).toBuffer('PNG', function (err, buffer) {
    console.log('resizing done.');
    var png = new PNG;
    png.parse(buffer, function (err, image) {
      console.log(err);
//       console.log(data.width);
//       console.log(data.height);
//       console.log(data);
       for (var i = 0; i < image.height; ++i) {
         for (var j = 0; j < image.width; ++j) {
           var idx = (image.width * i + j) << 2;
//           process.stdout.write(image.data[idx] + ',');
//           process.stdout.write(image.data[idx + 1] + ',');
//           process.stdout.write(image.data[idx + 2] + ',');
           process.stdout.write((image.data[idx + 3] >= 128 ? 1 : 0) + '');
// //          image.data[idx] && console.log(image.data[idx]);
// //          console.log(image[idx + 1]);
         }
         console.log('');
       }
//       var input = image.data.filter(function (value, index) {
//         return index & 3 == 3;
//       });
      var input = [];
      for (var i = 3; i < image.width * image.height * 4; i += 4) {
        input.push(image.data[i]);
      }
//      console.log(input);
      var vol = new convnetjs.Vol(IMAGE_SIZE, IMAGE_SIZE, 1);
//      vol.w = digits[0].image;
      vol.w = input;
      console.log('input size: ' + input.length);
      var recognitionResult = net.forward(vol);
      for (var j = 0; j < 10; ++j) {
        console.log(recognitionResult.w[j]);
      }
      res.end();
    });
    if (err) {
      console.error(err);
    } else {
      console.log(buffer.length);
    }
  });
});

app.listen(8000, function () {
  console.log('Express app listening...');
});
