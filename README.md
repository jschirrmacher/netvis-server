# NetVis Server

A Node.js application for a
[NetVis](https://github.com/jschirrmacher/netvis.git) based frontend
together with some sample data to provide an example for a quick start
for own implementations.

## What can it do?

- Display different types of network relations between nodes.
- Show detail descriptions for each node (if supplied) by clicking on the node.
- Optimized for larger networks by showing related nodes only when requested.
- Live-Edit feature: when changing the details of a node, those changes are sent to other clients via Websocket in real-time.
- View-only version (without edit feature) works without a backend on every simple web server just by copying the files.
  Like [here in github](https://jschirrmacher.github.io/netvis-server/public/).

See the example below to see it in action.

## Example

[![Screenshot - click to see it in action](https://jschirrmacher.github.io/netvis-server/public/netvis.gif)](https://jschirrmacher.github.io/netvis-server/public/)

[Click image to see it live](https://jschirrmacher.github.io/netvis-server/public/) (though you cannot edit there because it only works statically)

## Use with Docker

The simplest way to try this is to use [Docker](https://docs.docker.com/install/). Just run it on your local computer, by using the pre-built image:

    docker run -it --rm -p 3000:3000 joschi64/netvis-server

You can even use own data by using a volume and set an environment accordingly:

    docker run -it --rm -p 3000:3000 -e INIT_FILE=/server/init/data.json -v `pwd`/init:/server/init joschi64/netvis-server

This mounts an `init` folder from your local disk in a path inside the docker container and instructs the server to use
the file inside (`data.json`) as the initialization of the network. In this case, a copy of this data is created on the
first run, so it don't get any changes you do later in your data.

This behaviour can be modified by mounting a `data` volume into `/server/data`. If you change the files inside of this
folder, these changes are at least used if you restart your container. This should be sufficient if you want to show
different data sets but don't want to change the code.

   docker run -it --rm -p 3000:3000 -v `pwd`/data:/server/data joschi64/netvis-server


## Install and start server

If you do not want to use docker, or if you want to have more control over the code,
you should install [Node.js](https://nodejs.org/en/) at least in version 8 and checkout the code.

Install the server with

    git clone https://github.com/jschirrmacher/netvis-server.git

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
