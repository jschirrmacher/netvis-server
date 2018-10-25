const converter = new showdown.Converter()
const source = document.getElementById('detailForm').innerHTML
const detailFormTemplate = Handlebars.compile(source)
const match = location.search.match(/\bt=(\w+)/)
const type = match ? match[1] : 'person'
const name = 'data/' + type

const network = new Network(name, '#root', {
  nameRequired: function() {
    return Promise.resolve(window.prompt('Name'))
  },
  newNode: function(name) {
    console.log('New node', name)
    return {name, shape: 'circle'}
  },
  nodeRemoved: function(node) {
    console.log('Node removed', node)
  },
  newLink: function(link) {
    console.log('New link', link)
  },
  showDetails: function(data, form, node) {
    return new Promise(resolve => {
      Object.keys(data.links).forEach(function (index) {
        data.links[index].linkTitle = Handlebars.compile(texts.linkTitle)(data.links[index])
      })
      data.mdDescription = converter.makeHtml(data.description || texts['defaultDescription'])
      data.editable = 'contentEditable="true"'
      form.innerHTML = detailFormTemplate(data)
      form.dataset.id = node.id
      document.querySelectorAll('.command').forEach(el => {
        el.classList.toggle('active', !el.dataset.visible || !!eval(el.dataset.visible))
        el.addEventListener('click', event => {
          network[event.target.dataset.cmd](node, event.target.dataset.params)
          resolve()
        })
      })
      form.getElementsByClassName('close')[0].addEventListener('click', event => {
        event.preventDefault()
        resolve()
      })
    })
  }
}, texts)

document.addEventListener('input', function (event) {
  const body = JSON.stringify({[event.target.dataset.name]: event.target.innerHTML})
  const headers = {'Content-Type': 'application/json'}
  const idElement = event.path.find(el => el.dataset.id)
  if (idElement) {
    fetch('/node/' + idElement.dataset.id, {method: 'PUT', body, headers})
      .catch(console.error)
  }
})
