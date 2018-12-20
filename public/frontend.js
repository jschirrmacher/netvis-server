const converter = new showdown.Converter()
const source = document.getElementById('detailForm').innerHTML
const detailFormTemplate = Handlebars.compile(source)
const match = location.search.match(/\bt=(\w+)/)
const type = match ? match[1] : 'person'
const runsStatic = Array.from(document.scripts).find(s => s.attributes.src && s.attributes.src.nodeValue === 'frontend.js').dataset.static
const name = runsStatic ? 'data.json' : type + 's'
const linkTitle = Handlebars.compile(texts.linkTitle)

const module = {}
let network

const script = document.createElement('script')
script.addEventListener('load', function () {
  network = new Network({
    dataUrl: name,
    domSelector: '#root',
    maxLevel: 3,
    nodeRenderer: new NodeRenderer({levelSteps: 0.15}),
    handlers: {
      prepare: function (data) {
        return Object.assign(data, {nodes: data.nodes.map(node => Object.assign(node, {visible: node.type === type}))})
      },
      nameRequired: function () {
        return Promise.resolve(window.prompt('Name'))
      },
      newNode: function (name) {
        console.log('New node', name)
        return {name, shape: 'circle'}
      },
      nodeRemoved: function (node) {
        console.log('Node removed', node)
      },
      newLink: function (link) {
        console.log('New link', link)
      },
      showDetails: function (data, form, node) {
        return new Promise(resolve => {
          data.linkTitles = Object.keys(data.links).map(function (type) {
            return {type, title: linkTitle({title: texts[type] || type})}
          })
          data.mdDescription = converter.makeHtml(data.description || texts['defaultDescription'])
          if (!runsStatic) {
            data.editable = 'contentEditable="true"'
          }
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
    }
  })

  if (!runsStatic) {
    function interpreter(msg) {
      switch (msg.type) {
        case 'scaleToNode':
          network.scaleToNode(msg.node)
          network.update()
          break

        case 'create':
          network.addNode(msg.node)
          break

        case 'delete':
          network.removeNode(msg.node)
          break

        case 'update':
          network.updateNode(msg.node)
      }
    }

    const script = document.createElement('script')
    script.onload = function () {
      returnExports({location, route: 'feed', interpreter, timer: window, WebSocket})
    }
    script.src = 'UpdateListener.js'
    document.body.appendChild(script)
  }
})
script.src = runsStatic ? 'https://jschirrmacher.github.io/netvis/dist/bundle.js' : '/netvis.js'
document.body.appendChild(script)

document.addEventListener('input', function (event) {
  const body = JSON.stringify({[event.target.dataset.name]: event.target.innerHTML})
  const headers = {'Content-Type': 'application/json'}
  const path = event.path || (event.composedPath && event.composedPath()) || []
  const idElement = path.find(el => el.dataset.id)
  if (idElement) {
    fetch('nodes/' + idElement.dataset.id, {method: 'PUT', body, headers})
      .catch(console.error)
  }
})
