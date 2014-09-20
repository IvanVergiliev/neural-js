/** @jsx React.DOM */

/* eslint-env browser */
/* global $, React */

var DigitRecognizer = React.createClass({
  getInitialState: function () {
    return {digit: -1};
  },
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
    var digitRecognizer = this;
    $.post('/recognize', {image: dataUrl}, function (data) {
      console.log(data);
      digitRecognizer.setState({digit: data.result});
    });
  },
  handleGuessResult: function (digit) {
    var dataUrl = this.refs.drawingArea.getDOMNode().toDataURL();
    $.post('/train', {image: dataUrl, label: digit});
    this.setState(this.getInitialState());
  },
  clearDrawing: function () {
    var drawingArea = this.refs.drawingArea.getDOMNode();
    var context = drawingArea.getContext('2d');
    context.clearRect(0, 0, drawingArea.width, drawingArea.height);
  },
  render: function () {
    return (
      <div className='recognizer'>
        <canvas className='drawingArea' ref='drawingArea' width={300} height={300}
          onTouchStart={this.drawTouchEvent}
          onTouchMove={this.drawTouchEvent}></canvas>
        <div className='buttonBar'>
          <button className='recognize' ref='submit' onClick={this.recognize}>Recognize</button>
          <button className='clear' onClick={this.clearDrawing}>Clear</button>
        </div>
        <ResultOverlay digit={this.state.digit} handleGuessResult={this.handleGuessResult} />
      </div>
    );
  }
});

var ResultOverlay = React.createClass({
  handleCorrectGuess: function () {
    this.props.handleGuessResult(this.props.digit);
  },
  handleIncorrectGuess: function () {
    var result = Number(window.prompt('What is it, really?', this.props.digit));
    this.props.handleGuessResult(result);
  },
  render: function () {
    if (this.props.digit == -1) {
      return null;
    }
    return (
      <div className='overlay'>
        <div className='message'>
          {'It\'s a'}
          <div className='result'>{this.props.digit}</div>
        </div>
        <div className='buttonBar'>
          <button className='correct' onClick={this.handleCorrectGuess}>Nice!</button>
          <button className='wrong' onClick={this.handleIncorrectGuess}>Not really</button>
        </div>
      </div>
    )
  }
});

React.initializeTouchEvents(true);
React.renderComponent(<DigitRecognizer />, document.getElementById('digitRecognizer'));
