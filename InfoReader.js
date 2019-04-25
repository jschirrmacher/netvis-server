/* eslint-env node */

const filterWords = require('./filterwords')

module.exports = async function (db, client) {
  const rooms = await db.rocketchat_room.find({t: 'c'})
  const roomWords = Object.assign({}, ...rooms.map(room => ({[room._id]: {}})))

  const cursor = await db.rocketchat_message.findWithCursor({}, {msg: 1, rid: 1})
  while (await cursor.hasNext()) {
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
      .slice(0, 20)
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

  return nodes
}