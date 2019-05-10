/* eslint-env node */
const fs = require('fs')
const path = require('path')
const YAML = require('yamljs')

if (!fs.existsSync('data')) {
  fs.mkdir('data')
}

const stream = fs.createWriteStream(path.resolve('data', 'changes.yaml'), {flags:'a'})

module.exports = class DataCollector {
  constructor() {
    this.store = {rooms: [], persons: [], topics: []}
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

  async getAll() {
    const nodes = [
      ...this.store.rooms,
      ...this.store.persons,
      ...this.store.topics
    ]
    if (nodes.length === 0) {
      return {nodes: [{id: -1, name: 'No data existing yet'}]}
    }
    return {nodes}
  }

  find(type, node) {
    return this.store[type + 's'].find(n => n.id === node.id || n.name === node.name)
  }

  addNode(type, node, prepareNode) {
    const existing = this.find(type, node)
    if (existing) {
      existing.weight += node.weight
      prepareNode(existing)
      stream.write(YAML.stringify([{ts: new Date(), type: 'update', node: existing}]))
      this.notifyListeners({type: 'change', node: existing})
      return existing.id
    } else {
      if (!node.id) {
        node.id = type + '_' + node.name
      }
      prepareNode(node)
      this.store[type + 's'].push(node)
      stream.write(YAML.stringify([{ts: new Date(), type: 'add', node}]))
      this.notifyListeners({type: 'add', node})
      return node.id
    }
  }

  async change(id, type, change) {
    const node = this.store[type].find(n => n.id === +id)
    if (node) {
      Object.keys(change).forEach(name => node[name] = change[name])
      stream.write(YAML.stringify([{ts: new Date(), type: 'change', id, change}]))
    }
    this.notifyListeners({type: 'change', node})
    return node
  }
}
