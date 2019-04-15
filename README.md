# Assistify NetVis Server

A Node.js application for a
[NetVis](https://github.com/jschirrmacher/netvis.git) based frontend
together with some sample data from Assistify.

See https://assistify.github.io/netvis-server/public/ for an example.

## What can it do?

- Display different types of network relations between nodes.
- Show detail descriptions for each node (if supplied) by clicking on the node.
- Optimized for larger networks by showing related nodes only when requested.
- Live-Edit feature: when changing the details of a node, those changes are sent to other clients via Websocket in real-time.
- View-only version (without edit feature) works without a backend on every simple web server just by copying the files.

## Installation

Simply `git clone https://github.com/assistify/netvis-server.git`

## Static use

Open the file `/public/index.html` in your browser to see a view-only version.
It is fully interactive, but cannot be edited.
This is only possible with the server variant.

To change the data to be displayed, change the `/public/data.json` file.

## Install and start server

If you want to change the content interactively,
you should install [Node.js](https://nodejs.org/en/) at least in version 10.

After that, install all dependencies:

    npm install

then start the server:

    npm start

or, if you want to change the code, the development server, which
watches the source files and restarts when a change is recognized:

    npm run start-dev

Then open http://localhost:3000 and see the example data in your browser

## Parameters

If port 3000 is already occupied on your machine, or if you just like to
use another port, simply set the environment before starting the server:

    PORT=3001 npm start
