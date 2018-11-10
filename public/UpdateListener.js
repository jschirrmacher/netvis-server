'use strict'

let keepAlive

module.exports = function (host, path, network) {
  function retryConnection() {
    setTimeout(setupWSConnection, 10000)
  }

  function setupWSConnection() {
    if (keepAlive) {
      clearInterval(keepAlive)
    }

    const socket = new WebSocket(`ws://${host}/${path}`)
    if (!socket) {
      retryConnection()
      return
    }

    socket.onopen = function (event) {
      keepAlive = setInterval(function () {
        socket.send(JSON.stringify({type: 'keepalive'}))
      }, 60000)
    }

    socket.onclose = function (event) {
      retryConnection()
    }

    socket.onerror = function (event) {
      socket.close()
      retryConnection()
    }

    socket.onmessage = function (event) {
      const msg = JSON.parse(event.data)
      switch (msg.type) {
        case 'scaleToNode':
          network.scaleToNode(msg.node)
          network.update()
          break

        case 'create':
          network.addNode(msg.node)
          break

        case 'delete':
          network.removeNode(msg.node)
          break

        case 'update':
          network.updateNode(msg.node)
      }
    }
  }

  return setupWSConnection()
}
