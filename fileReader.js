/* eslint-env node */

const logger = console
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

async function readData(fileName) {
  const data = JSON.parse(fs.readFileSync(fileName).toString())
  const headers = {'content-type': 'application/json'}
  await Promise.all(Object.keys(data).map(async roomId => {
    const body = JSON.stringify(data[roomId])
    const result = await fetch('http://localhost:3000/rooms', {method: 'post', body, headers})
    if (!result.ok) {
      throw {errorCode: result.status, message: await result.json()}
    }
  }))
}

const filename = process.argv[2]
if (filename) {
  readData(path.resolve(__dirname, filename))
    .then(() => logger.info('Data loaded'))
    .catch(logger.error)
} else {
  logger.error(`\nUsage:\n\tnode databaseReader <clientName>\n`)
}
