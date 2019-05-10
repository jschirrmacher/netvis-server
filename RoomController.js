/* eslint-env node */

module.exports = ({dataCollector}) => {
  function prepareTopic(node) {
    node.className = 'topic'
  }

  function preparePerson(node) {
    node.className = 'person'
    node.weight = 1
  }

  function prepareRoom(node) {
    node.className = 'room'
    node.weight = (node.links.topics && Math.log(node.links.topics.length) / Math.log(4)) || 1
  }

  return {
    addRoom(data) {
      data.links = data.links || {}
      if (data.topics) {
        data.links.topics = data.topics.map(topic => dataCollector.addNode('topic', topic, prepareTopic))
        delete data.topics
      }
      if (data.users) {
        data.links.persons = data.users.map(person => dataCollector.addNode('person', person, preparePerson))
        delete data.users
      }
      dataCollector.addNode('room', data, prepareRoom)
      return {ok: true}
    }
  }
}