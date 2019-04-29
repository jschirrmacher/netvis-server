/* eslint-env node */

module.exports = ({db, client, logger}) => {
  return {
    async getConnectedPersons() {
      const users = (await db.users.find({}, {username: 1}))
        .map(user => Object.assign(user, {username: user.username || user.name}))

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
          visible: !['diarybot', 'assistify', 'assistify.admin', 'rocket.cat'].includes(user.username),
          visibility: Math.sqrt(convPartners.length)
        })
      }))
    }
  }
}
