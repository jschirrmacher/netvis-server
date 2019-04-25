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

const filterWords = [
  'ich', 'du', 'er', 'sie', 'es', 'wir', 'der', 'die', 'das', 'dem', 'ja', 'nein', 'zu', 'auch', 'kein', 'keine',
  'ist', 'hat', 'auf', 'nicht', 'von', 'ein', 'eine', 'einen', 'und', 'dass', 'aber', 'kann', 'dazu', 'dann', 'noch',
  'wenn', 'habe', 'mehr', 'nur', 'dir', 'mir', 'in', 'den', 'bitte', 'nach', 'werden', 'wird', 'machen', 'bzw', 'mit',
  'ihr', 'da', 'jetzt', 'bald', 'alles', 'danke', 'ohne', 'innerhalb', 'also', 'mehr', 'schon', 'wo', 'wer', 'wie',
  'warum', 'am', 'so', 'dich', 'gibt', 'diesen', 'bereits', 'oder', 'hier', 'um', 'im', 'an', 'sich', 'dort', 'bei',
  'was', 'deine', 'denn', 'hier', 'für', 'man', 'wieder', 'haben', 'sind', 'mal', 'uns', 'über', 'hallo', 'aus', 'des',
  'euch', 'gerade', 'geht', 'muss', 'sein', 'zur', 'können', 'zum', 'mich', 'alle', 'ok', 'als', 'gerne', 'kannst',
  'war', 'neu', 'nun', 'hab', 'jemand', 'würde', 'nochmal', 'immer', 'habt', 'kommt', 'wäre', 'unsere', 'sollte',
  'wurde', 'woher', 'dank', 'vielen', 'hi', 'benötigt', 'leider', 'unser', 'gleich', 'gleiche', 'soll', 'andere',
  'anderen', 'einem', 'allerdings', 'ob', 'hast', 'diese', 'vielen', 'anscheinend', 'durch', 'kurz', 'mittlerweile',
  'deshalb', 'darum', 'dafür', 'hätte', 'würdest', 'sehr', 'zusammen', 'erreichen', 'fehlt', 'irgendwie', 'brauchen',
  'vom', 'dran', 'bin', 'etwas', 'beim', 'könnte', 'morgen', 'heute', 'gestern', 'damit', 'schreiben', 'zugreifen',
  'bzgl', 'doch', 'evtl', 'gut', 'will', 'benötigen', 'dies', 'klar', 'kleiner', 'könnt', 'lassen', 'gesagt', 'wurden',
  'vorher', 'betrifft', 'erste', 'je', 'erstmal', 'weder', 'ggf', 'unter', 'scheint', 'zwischen', 'bis', 'läuft',
  'nichts', 'läuft',
  'you', 'the', 'and', 'to', 'for', 'true', 'false', 'is', 'we', 'not', 'no'
]

const startTime = +new Date()
MongoDB('mongodb://localhost:27017', client)
  .then(async db => {
    const users = (await db.users.find({}, {username: 1}))
      .map(user => Object.assign(user, {username: user.username || user.name}))
    const rooms = await db.rocketchat_room.find({t: 'c'})
    const roomWords = Object.assign({}, ...rooms.map(room => ({[room._id]: {}})))

    const cursor = await db.rocketchat_message.findWithCursor({}, {msg: 1, rid: 1})
    while(await cursor.hasNext()) {
      const doc = await cursor.next()
      if (doc.msg && roomWords[doc.rid] && doc.t !== 'uj') {
        doc.msg.split(' ')
          .filter(word => !word.match(/^@/))    // filter user names
          .filter(word => !word.match(/^http?s:\/\//))
          .map(word => word.replace(/[^A-Za-z\u00C0-\u017F]/g, '').toLowerCase())   // remove non-alpha-chars
          .filter(word => word.length > 1)
          .filter(word => !word.match(/^\d*$/))   // filter numbers
          .filter(word => !filterWords.includes(word))    // filter stopwords
          .map(word => {
            roomWords[doc.rid] = roomWords[doc.rid] || {}
            roomWords[doc.rid][word] = roomWords[doc.rid][word] || 0
            roomWords[doc.rid][word]++
          })
      }
    }
    const words = {}
    Object.keys(roomWords).forEach(roomId => {
      roomWords[roomId] = Object.keys(roomWords[roomId])
        .map(word => ({word, num: roomWords[roomId][word]}))
        .sort((a, b) => b.num - a.num)
        .slice(0, 15)
      roomWords[roomId].forEach(e => {
        words[e.word] = (words[e.word] || 0) + e.num
      })
    })

    const nodes = []
    Object.keys(words).forEach(word => {
      nodes.push({
        id: 'w_' + word,
        name: word,
        type: 'topic',
        links: {
          rooms: []
        }
      })
    })

    rooms.forEach(room => {
      const topics = roomWords[room._id].map(info => {
        const id = 'w_' + info.word;
        const node = nodes.find(n => n.id === id)
        if (node) {
          node.links.rooms.push(room._id)
        }
        return id
      })
      const radius = Math.sqrt(room.usersCount * 10) + 20
      if (room.parentRoomId && !rooms.find(r => r._id === room.parentRoomId)) {
        delete room.parentRoomId
      }
      const node = {
        id: room._id,
        name: room.name,
        type: 'room',
        shape: 'circle',
        radius,
        url: 'https://' + client + '.assistify.noncd.db.de/channel/' + room.name,
        links: {topics}
      }
      if (room.parentRoomId) {
        node.links.parents = [room.parentRoomId]
      }
      nodes.push(node)
    })

    nodes.forEach(n => {
      if (n.type === 'topic') {
        const size = Math.sqrt(n.links.rooms.length * 200) + 100
        n.width = size
        n.height = size * 0.7
        n.fontSize = Math.sqrt(n.links.rooms.length * 2)
        n.visible = n.links.rooms.length > 5
        n.shape = 'rect'
      }
    })

    async function getConnectedPersons() {
      return await Promise.all(users.map(async user => {
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
    }

    app.get('/persons', async (req, res) => res.json({nodes: await getConnectedPersons()}))
    app.get('/rooms', async (req, res) => res.json({nodes}))
    app.get('/topics', async (req, res) => res.json({nodes}))
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
      logger.info(`Listening on http://localhost:${PORT}`)
      logger.info('Startup time: ' + (+new Date() - startTime)/1000 + 'sec.')
    })
  })
