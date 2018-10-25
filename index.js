/* eslint-env node */
const express = require('express')
const app = express()
const path = require('path')
const DataCollector = require('./DataCollector')
const dataCollector = new DataCollector()

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)   // eslint-disable-line no-console
    next()
})

function sendNodes(source, selector, res) {
  const calculateFields = node => {
    node.visible = !!selector.exec(node.type)
    if (node.type === 'topic') {
      node.fontSize = node.links ? Math.sqrt(node.links.reduce((s, e) => s + e.nodes.length, 0)) : 1
    }
    return node
  }

  dataCollector
    .get(source)
    .then(nodes => nodes.map(calculateFields))
    .then(nodes => res.json({nodes}))
}

app.use('/netvis.js', express.static(path.join(__dirname, 'node_modules', 'js-netvis', 'dist', 'bundle.js')))
app.use('/data/:what', (req, res) => sendNodes('data', new RegExp('root|' + req.params.what), res))
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
app.get('/view/*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`) // eslint-disable-line no-console
})
