/* eslint-env node */
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const Model = require('./Model');
const model = new Model()
const roomController = require('./RoomController')({model})
const WSUpdater = require('js-ws-updater')
const logger = console

new WSUpdater({app, route: '/feed', modelListener: model, expressWs: require('express-ws')})

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

const nodeModulesDir = path.resolve(__dirname, '..', 'node_modules')
app.use('/UpdateListener.js', express.static(path.join(nodeModulesDir, 'js-ws-updater', 'UpdateListener.js')))
app.use('/netvis', express.static(path.join(nodeModulesDir, 'js-netvis', 'dist')))
app.get('/', sendIndex)

app.get('/rooms', jsonService(() => model.getAll()))
app.get('/topics', jsonService(() => model.getAll()))
app.get('/persons', jsonService(() => model.getAll()))

app.post('/rooms', jsonService(req => roomController.addRoom(req.body)))
app.put('/rooms', jsonService(req => roomController.addRoom(req.body)))

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
