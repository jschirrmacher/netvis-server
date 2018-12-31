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

if (!fs.exists('data')) {
  fs.mkdir('data', () => dataCollector.initializeFromData())
}

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)   // eslint-disable-line no-console
    next()
})

function sendNodes(source, res) {
  const calculateFields = node => {
    if (node.type === 'topic') {
      node.fontSize = node.links ? Math.sqrt(Object.keys(node.links).reduce((s, k) => s + node.links[k].length, 0)) : 1
    }
    return node
  }

  dataCollector
    .get(source)
    .then(nodes => nodes.map(calculateFields))
    .then(nodes => res.json({nodes}))
}

function sendIndex(req, res){
  const indexFile = fs.readFileSync(path.join(__dirname, 'public', 'index.html')).toString()
  res.send(indexFile.replace(' data-static="true"', ''))
}

app.use('/UpdateListener.js', express.static(path.join(__dirname, 'node_modules', 'js-ws-updater', 'UpdateListener.js')))
app.use('/netvis', express.static(path.join(__dirname, 'node_modules', 'js-netvis', 'dist')))
app.get('/', sendIndex)

app.get('/persons', (req, res) => sendNodes('data', res))
app.get('/topics', (req, res) => sendNodes('data', res))
app.put('/nodes/:id', (req, res) => res.json(dataCollector.saveNodeChanges(req.params.id, req.body)))

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
  console.log(`Listening on http://localhost:${PORT}`) // eslint-disable-line no-console
})
