# NetVis Server

A simple Node.js application for a
[NetVis](https://github.com/jschirrmacher/netvis.git) based frontend
together with some sample data to provide an example for a quick start
for own implementations.

## Install and start server

To run the server, you need to install [Node.js](https://nodejs.org/en/)
at least in version 8.

Install the server with

    git clone https://github.com/jschirrmacher/netvis-server.git

After that, install all dependencies:

    npm install

then start the server:

    npm start

Then open http://localhost:3000 and see the example data in your browser

## Parameters

If port 3000 is already occupied on your machine, or if you just like to
use another port, simply set the environment before starting the server:

    PORT=3001 npm start
