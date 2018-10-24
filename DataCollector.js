/* eslint-env node */
const fs = require('fs')
const path = require('path')

class DataCollector {
  constructor() {
    this.store = {}
  }

  readDir(source) {
    return new Promise((resolve, reject) => {
      fs.readdir(source, null, (err, result) => err ? reject(err) : resolve(result.map(file => path.join(source, file))))
    })
  }

  async readData(source) {
    const list = await this.readDir(path.join(__dirname, source))
    return list.map(file => JSON.parse(fs.readFileSync(file)))
  }

  async get(source) {
    return this.store[source] || (this.store[source] = await this.readData(source))
  }
}

module.exports = DataCollector
