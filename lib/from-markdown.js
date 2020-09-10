var matters = require('micromark-extension-frontmatter/lib/matters')

module.exports = createFromMarkdown

function createFromMarkdown(options) {
  var settings = matters(options)
  var length = settings.length
  var index = -1
  var enter = {}
  var exit = {}
  var matter

  while (++index < length) {
    matter = settings[index]
    enter[matter.type] = opener(matter)
    exit[matter.type] = close
    exit[matter.type + 'Value'] = value
  }

  return {enter: enter, exit: exit}
}

function opener(matter) {
  return open
  function open(token) {
    this.enter({type: matter.type, value: ''}, token)
    this.buffer()
  }
}

function close(token) {
  var data = this.resume()
  // Remove the initial and final eol.
  this.exit(token).value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, '')
}

function value(token) {
  this.handlers.enter.data.call(this, token)
  this.handlers.exit.data.call(this, token)
}
