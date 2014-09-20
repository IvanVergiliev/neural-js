/* eslint-env node */
var convnetjs = require('convnetjs');
var convNet = require('./convNet');
var path = require('path');

var digits = convNet.parseTrainingData();
var net = convNet.initNetwork();

var trainer = new convnetjs.SGDTrainer(net, {method: 'adadelta', l2_decay: 0.001,
                                    batch_size: 20});
convNet.trainNetwork(trainer, digits);

var express = require('express');
var bodyParser = require('body-parser');
var gm = require('gm');
var PNG = require('pngjs').PNG;

var app = express();
app.use(express.static(path.join(__dirname, '/static')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var resizeAndParse = function (dataUrl, cb) {
  dataUrl = dataUrl.replace('data:image/png;base64,', '');
  var img = new Buffer(dataUrl, 'base64');
  gm(img).resize(28, 28).toBuffer('PNG', function (err, buffer) {
    if (err) {
      cb(err);
      return;
    }
    var png = new PNG();
    png.parse(buffer, function (err, image) {
      if (err) {
        cb(err);
        return;
      }
      for (var i = 0; i < image.height; ++i) {
        for (var j = 0; j < image.width; ++j) {
          var idx = (image.width * i + j) << 2;
          process.stdout.write((image.data[idx + 3] >= 128 ? 1 : 0) + '');
        }
        console.log('');
      }
      var input = [];
      for (var i = 3; i < image.width * image.height * 4; i += 4) {
        input.push(image.data[i]);
      }
      var vol = new convnetjs.Vol(convNet.IMAGE_SIZE, convNet.IMAGE_SIZE, 1);
      vol.w = input;
      cb(null, vol);
    });
  });
};

app.post('/recognize', function (req, res) {
  var dataUrl = req.body.image;
  resizeAndParse(dataUrl, function (err, input) {
    if (err) {
      res.json({error: err});
      return;
    }
    var recognitionResult = net.forward(input);
    var bestProb = -1;
    var bestCandidate = -1;
    for (var j = 0; j < 10; ++j) {
      if (recognitionResult.w[j] > bestProb) {
        bestProb = recognitionResult.w[j];
        bestCandidate = j;
      }
      console.log(recognitionResult.w[j]);
    }
    res.json({result: bestCandidate});
  });
});

app.post('/train', function (req, res) {
  var dataUrl = req.body.image;
  var label = req.body.label;
  resizeAndParse(dataUrl, function (err, input) {
    if (err) {
      res.json({error: err});
      return;
    }
    res.end();
    trainer.train(input, Number(label));
    console.log('Added a training example for ' + label);
  });
});

var server = app.listen(8000, function () {
  console.log('Express app listening on port ' + server.address().port + '...');
});
