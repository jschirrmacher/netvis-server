/* eslint-env node */
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const DataCollector = require('./DataCollector')
const dataCollector = new DataCollector()

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

app.use('/netvis.js', express.static(path.join(__dirname, 'node_modules', 'js-netvis', 'dist', 'bundle.js')))
app.get('/', sendIndex)

app.use('/nodes', (req, res) => sendNodes('data', res))
app.put('/nodes/:id', (req, res) => res.json(dataCollector.saveNodeChanges(req.params.id, req.body)))

app.use(express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`) // eslint-disable-line no-console
})
