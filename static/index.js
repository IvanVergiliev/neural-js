/** @jsx React.DOM */

/* eslint-env browser */
/* global $, React */

var DigitRecognizer = React.createClass({
  drawTouchEvent: function drawTouchEvent(event) {
    var context = this.refs.drawingArea.getDOMNode().getContext('2d');
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
  },
  recognize: function () {
    var dataUrl = this.refs.drawingArea.getDOMNode().toDataURL();
    $.post('/recognize', {image: dataUrl});
  },
  render: function () {
    return (
      <div className='recognizer'>
        <canvas className='drawingArea' ref='drawingArea' width={600} height={600} onTouchStart={this.drawTouchEvent} onTouchMove={this.drawTouchEvent}></canvas>
        <br />
        <button className='recognize' ref='submit' onClick={this.recognize}>Recognize</button>
      </div>
    )
  }
});

React.initializeTouchEvents(true);
React.renderComponent(<DigitRecognizer />, document.getElementById('digitRecognizer'));
