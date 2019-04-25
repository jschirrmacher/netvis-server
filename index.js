/* eslint-env node */
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const DataCollector = require('./DataCollector')
const dataCollector = new DataCollector()
const WSUpdater = require('js-ws-updater')
const logger = console
const MongoDB = require('./MongoDB')({logger})

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

const client = 'business-hub'

const InfoReader = require('./InfoReader')

const startTime = +new Date()
MongoDB('mongodb://localhost:27017', client)
  .then(async db => {
    const nodes = await InfoReader(db)

    app.get('/rooms', async (req, res) => res.json({nodes}))
    app.get('/topics', async (req, res) => res.json({nodes}))
    // app.put('/nodes/:id', (req, res) => res.json(dataCollector.saveNodeChanges(req.params.id, req.body)))

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
      logger.info('Startup time: ' + (+new Date() - startTime)/1000 + 'sec.')
    })
  })
