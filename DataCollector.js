/* eslint-env node */
const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

if (!fs.existsSync('data')) {
  fs.mkdir('data')
}

const stream = fs.createWriteStream(path.resolve('data', 'changes.yaml'), {flags:'a'})

class DataCollector {
  constructor() {
    this.store = null
    this.listeners = {}
  }

  registerListener(listener) {
    const id = Math.max(...Object.keys(this.listeners), 0) + 1
    this.listeners[id] = listener
    return id
  }

  unregisterListener(listenerId) {
    delete this.listeners[listenerId]
  }

  notifyListeners(change) {
    Object.values(this.listeners).forEach(listener => listener(change))
  }

  readDir(source) {
    return new Promise((resolve, reject) => {
      fs.readdir(source, null, (err, result) => err ? reject(err) : resolve(result.map(file => path.join(source, file))))
    })
  }

  async get() {
    if (!this.store) {
      const initFile = process.env.INIT_FILE || path.join(__dirname, 'public', 'data.json')
      this.store = JSON.parse(fs.readFileSync(initFile).toString())
    }
    return this.store.nodes
  }

  async saveNodeChanges(id, change) {
    const nodes = await this.get('data')
    const node = nodes.find(n => n.id === +id)
    if (node) {
      Object.keys(change).forEach(name => node[name] = change[name])
      stream.write(YAML.stringify([node]))
    }
    this.notifyListeners({type: 'update', node})
    return node
  }
}

module.exports = DataCollector
