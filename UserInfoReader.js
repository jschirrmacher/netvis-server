/* eslint-env node */

const faker = require('faker')

module.exports = ({db, client, logger}) => {
  return {
    async getConnectedPersons() {
      const users = (await db.users.find({}, {username: 1}))
        .map(user => Object.assign(user, {username: user.username || user.name, fake_name: faker.name.findName()}))

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

        const isSys = ['diarybot', 'assistify', 'assistify.admin', 'rocket.cat'].includes(user.username)
        return ({
          id: user._id,
          name: user.fake_name,
          type: 'person',
          shape: 'circle',
          radius: Math.sqrt(rooms.length * 20) + 10,
          links: {
            persons: convPartners.map(person => person.id)
          },
          weights: Object.assign({}, ...convPartners.map(person => ({[person.id]: person.msgs}))),
          url: 'https://' + client + '.assistify.noncd.db.de/direct/' + user.fake_name,
          visible: !isSys,
          visibility: isSys ? 0 : Math.sqrt(convPartners.length)
        })
      }))
    }
  }
}
