/* eslint-env node */
const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

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

  async get(source) {
    if (!this.store) {
      const list = await this.readDir(path.join(__dirname, source))
      this.store = list.map(file => YAML.load(file))
    }
    return this.store
  }

  async saveNodeChanges(id, change) {
    const nodes = await this.get('data')
    const node = nodes.find(n => n.id === +id)
    if (node) {
      Object.keys(change).forEach(name => node[name] = change[name])
      fs.writeFileSync(path.join(__dirname, 'data', id + '.yaml'), YAML.stringify(node))
    }
    this.notifyListeners({type: 'update', node})
    return node
  }

  async initializeFromData() {
    const initFile = process.env.INIT_FILE || path.join(__dirname, 'public', 'data.json')
    const data = JSON.parse(fs.readFileSync(initFile).toString())
    data.nodes.forEach(node => {
      fs.writeFileSync(path.join(__dirname, 'data', node.id + '.yaml'), YAML.stringify(node))
    })
  }
}

module.exports = DataCollector
