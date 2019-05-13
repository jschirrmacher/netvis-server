/* eslint-env node */
module.exports = class Model {
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

  addNode(type, node) {
    const existing = this.find(type, node)
    if (existing) {
      existing.weight += node.weight
      this.notifyListeners({type: 'change', node: existing})
      return existing.id
    } else {
      if (!node.id) {
        node.id = type + '_' + node.name
      }
      this.store[type + 's'].push(node)
      this.notifyListeners({type: 'add', node})
      return node.id
    }
  }

  async change(id, type, change) {
    const node = this.store[type].find(n => n.id === +id)
    if (node) {
      Object.keys(change).forEach(name => node[name] = change[name])
    }
    this.notifyListeners({type: 'change', node})
    return node
  }
}
