/* eslint-env node */

const fetch = require('node-fetch')
const logger = console
const database = require('./MongoDB')({logger})

async function readData(dbUrl, client) {
  const db = await database(dbUrl, client)
  const RoomReader = require('./RoomInfoReader')({db, client, logger})
  const roomsWithTopics = await RoomReader.getRoomsWithTopics()

  // const UserReader = require('./UserInfoReader')({db, client, logger})
  // const persons = await UserReader.getConnectedPersons()

  const headers = {'content-type': 'application/json'}
  await Promise.all(roomsWithTopics.map(async room => {
    const body = JSON.stringify(room)
    const result = await fetch('http://localhost:3000/rooms', {method: 'post', body, headers})
    if (!result.ok) {
      throw {errorCode: result.status, message: await result.json()}
    }
  }))
}

const client = process.argv[2]
if (client) {
  readData('mongodb://localhost:27017', client)
    .then(() => logger.info('Data loaded'))
    .catch(logger.error)
} else {
  logger.error(`\nUsage:\n\tnode databaseReader <clientName>\n`)
}
