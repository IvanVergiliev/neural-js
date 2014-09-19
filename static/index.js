$(function () {
  var c = document.getElementById('digit');
  // c.width = c.width * 2;
  // c.height = c.height * 2;
  var context = c.getContext('2d');

  var drawTouchEvent = function drawTouchEvent(event) {
    for (var i = 0; i < event.targetTouches.length; ++i) {
      var touch = event.targetTouches[i];
      context.save();
      context.beginPath();
      context.arc(touch.pageX, touch.pageY, 20, 0, 2 * Math.PI, true);
      context.restore();
      context.fill();
    }
    event.preventDefault();
    return false;
  };

  c.addEventListener('touchstart', drawTouchEvent);
  c.addEventListener('touchmove', drawTouchEvent);

  $('#recognize').on('touchend', function () {
    var dataUrl = c.toDataURL();
    $.post('/recognize', {image: dataUrl});
  });
});
