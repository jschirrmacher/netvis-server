/* eslint-env node */

class NewsFeed {
  constructor(app, dataCollector) {
    this.dataCollector = dataCollector
    require('express-ws')(app)
    app.ws('/feed', ws => this.socketListener(ws))
    this.connections = []
  }

  modelChangeListener(change, ws) {
    try {
      ws.send(JSON.stringify(change))
    } catch (error) {
      if (error.message.match(/WebSocket is not open/)) {
        ws.close()
        this.dataCollector.unregisterListener(this.listenerId)
      } else {
        console.error(error)
      }
    }
  }

  socketListener(ws) {
    const self = this

    this.listenerId = this.dataCollector.registerListener(change => this.modelChangeListener(change, ws))

    ws.on('message', function(msg) {
      ws.send(JSON.stringify(msg))
    })
  }
}

module.exports = NewsFeed
