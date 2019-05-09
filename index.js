/* eslint-env node */
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const DataCollector = require('./DataCollector')
const dataCollector = new DataCollector()
const WSUpdater = require('js-ws-updater')
const logger = console

new WSUpdater({app, route: '/feed', modelListener: dataCollector, expressWs: require('express-ws')})

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`)   // eslint-disable-line no-console
  next()
})

function sendIndex(req, res) {
  const indexFile = fs.readFileSync(path.join(__dirname, 'public', 'index.html')).toString()
  res.send(indexFile.replace(' data-static="true"', ''))
}

app.use('/UpdateListener.js', express.static(path.join(__dirname, 'node_modules', 'js-ws-updater', 'UpdateListener.js')))
app.use('/netvis', express.static(path.join(__dirname, 'node_modules', 'js-netvis', 'dist')))
app.get('/', sendIndex)

app.get('/rooms', jsonService(getNodes))
app.get('/topics', jsonService(getNodes))
app.get('/persons', jsonService(getNodes))

// app.put('/nodes/:id', (req, res) => res.json(dataCollector.saveNodeChanges(req.params.id, req.body)))

app.post('/rooms', jsonService(req => addRoom(req.body)))

app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  next({code: 404, message: `Route ${req.method} ${req.path} not found`})
})

app.use((err, req, res, next) => {  // eslint-disable-line
  logger.error(err)

  const result = {
    code: err.code,
    message: err.message
  }

  if (process.env.NODE_ENV === 'development') {
    result.error = err
  }

  res.status(err.code || 500).json(result)
})

app.listen(PORT, () => {
  logger.info(`Listening on http://localhost:${PORT}`)
})

function jsonService (func) {
  return async (req, res, next) => {
    try {
      res.json(await func(req))
    } catch (error) {
      next(error)
    }
  }
}

function addRoom(data) {
  data.links = data.links || {}
  if (data.topics) {
    data.links.topics = data.topics.map(topic => {
      const width = Math.sqrt(topic.weight) * 10 + 50
      const visibility = Math.sqrt(topic.weight)
      return dataCollector.addNode('topic', Object.assign(topic, {shape: 'rect', width, height: width * 0.7, visibility}))
    })
    delete data.topics
  }
  if (data.users) {
    data.links.persons = data.users.map(person => {
      return dataCollector.addNode('person', Object.assign(person, {shape: 'circle', radius: 50, visibility: 1}))
    })
    delete data.users
  }
  dataCollector.addNode('room', Object.assign(data, {shape: 'circle', radius: 50, visibility: 1}))
  return {ok: true}
}

function getNodes() {
  return dataCollector.getAll()
}
