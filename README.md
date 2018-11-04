# NetVis Server

A simple Node.js application for a
[NetVis](https://github.com/jschirrmacher/netvis.git) based frontend
together with some sample data to provide an example for a quick start
for own implementations.

## What can it do?

- Display differnt types of network relations between nodes.
- Show detail descriptions for each node (if supplied) by clicking on the node.
- Optimized for larger networks by showing related nodes only when requested.

See the example below to see how it in action.

## Example

[![Screenshot - click to see it in action](https://jschirrmacher.github.io/netvis-server/public/netvis.gif)](https://jschirrmacher.github.io/netvis-server/public/)

[Click image to see it live](https://jschirrmacher.github.io/netvis-server/public/)

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
