/* eslint-env node */

const faker = require('faker')

const names = {}

module.exports = ({model}) => {
  return {
    addRoom(data) {
      data.links = data.links || {}

      function prepareTopic(topic) {
        topic.className = 'topic'
        return model.addNode('topic', topic)
      }

      function preparePerson(name) {
        if (!names[name]) {
          names[name] = faker.name.findName()
        }
        const person = {
          className: 'person',
          weight: 1,
          name: names[name]
        }
        return model.addNode('person', person)
      }

      if (data.topics) {
        data.links.topics = data.topics.map(prepareTopic)
        delete data.topics
      }

      if (data.users) {
        data.links.persons = data.users.map(preparePerson)
        delete data.users
      }

      data.className = 'room'
      data.weight = (data.links.topics && Math.log(data.links.topics.length + 1) / Math.log(4)) || 1

      model.addNode('room', data)
      return {ok: true}
    }
  }
}