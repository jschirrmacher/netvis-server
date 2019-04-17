/* eslint-env node */
const fs = require('fs')
const express = require('express')
const app = express()
const path = require('path')
const DataCollector = require('./DataCollector')
const dataCollector = new DataCollector()
const WSUpdater = require('js-ws-updater')
const logger = console
const MongoDB = require('./MongoDB')({logger})

new WSUpdater({app, route: '/feed', modelListener: dataCollector, expressWs: require('express-ws')})

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const PORT = process.env.PORT || 3000

app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`)   // eslint-disable-line no-console
  next()
})

function sendIndex(req, res) {
  const indexFile = fs.readFileSync(path.join(__dirname, 'public', 'index.html')).toString()
  res.send(indexFile.replace(' data-static="true"', ''))
}

app.use('/UpdateListener.js', express.static(path.join(__dirname, 'node_modules', 'js-ws-updater', 'UpdateListener.js')))
app.use('/netvis', express.static(path.join(__dirname, 'node_modules', 'js-netvis', 'dist')))
app.get('/', sendIndex)

const client = 'business-hub'

MongoDB('mongodb://localhost:27017', client)
  .then(async db => {
    const users = (await db.users.find({}, {username: 1}))
      .map(user => Object.assign(user, {username: user.username || user.name}))

    const persons = await Promise.all(users.map(async user => {
      const rooms = await db.rocketchat_room.find({t: 'd', usernames: user.username})
      const relevantRooms = rooms.filter(room => room.usernames.some(name => name !== user.username))
      const convPartners = relevantRooms.map(room => {
          const partnerName = room.usernames.find(name => name !== user.username)
          const partner = users.find(user => user.username === partnerName)
          if (!partner) {
            logger.error('Partner ' + partnerName + ' not found in users list')
            return {msgs: 0}
          }
          return {
            id: partner._id,
            msgs: room.msgs
          }
        })
        .filter(info => info.msgs > 0)
      return ({
        id: user._id,
        name: user.name,
        type: 'person',
        shape: 'circle',
        radius: Math.sqrt(rooms.length * 20) + 10,
        links: {
          persons: convPartners.map(person => person.id)
        },
        weights: Object.assign({}, ...convPartners.map(person => ({[person.id]: person.msgs}))),
        url: 'https://' + client + '.assistify.noncd.db.de/direct/' + user.username,
        visible: !['diarybot', 'assistify', 'assistify.admin', 'rocket.cat'].includes(user.username)
      })
    }))
    logger.info('Data read from database - ready to retrieve it!')

    app.get('/persons', (req, res) => res.json({nodes: persons}))
    // app.get('/topics', (req, res) => sendNodes('data', res))
    // app.put('/nodes/:id', (req, res) => res.json(dataCollector.saveNodeChanges(req.params.id, req.body)))

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
  })
