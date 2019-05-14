/* eslint-env node */

module.exports = ({model}) => {
  return {
    addRoom(data) {
      data.links = data.links || {}

      function prepareTopic(topic) {
        topic.className = 'topic'
        return model.addNode('topic', topic)
      }

      function preparePerson(name) {
        const person = {
          className: 'person',
          weight: 1,
          name
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
      data.weight = (data.links.topics && Math.log(data.links.topics.length) / Math.log(4)) || 1

      model.addNode('room', data)
      return {ok: true}
    }
  }
}