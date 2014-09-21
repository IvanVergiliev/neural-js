neural-js
=========

Handwritten digit recognition in JavaScript using Convolutional Neural Networks

To install and run the server:

    git clone git@github.com:IvanVergiliev/neural-js.git
    cd neural-js
    # Install GraphicsMagick (http://www.graphicsmagick.org). On OS X, you can do 'brew install gm' if you're using brew.
    npm install
    make
    node main.js

The server should now train on the full dataset (takes about 10 minutes for all 60,000 images) and then listen for requests on `localhost:8000`. Open the page on a touch-enabled device and start drawing digits!
