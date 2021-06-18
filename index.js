import matters from 'micromark-extension-frontmatter/lib/matters.js'

export function frontmatterFromMarkdown(options) {
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

  return {enter, exit}
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
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

export function frontmatterToMarkdown(options) {
  var unsafe = []
  var handlers = {}
  var settings = matters(options)
  var length = settings.length
  var index = -1
  var matter

  while (++index < length) {
    matter = settings[index]
    handlers[matter.type] = handler(matter)
    unsafe.push({atBreak: true, character: fence(matter, 'open').charAt(0)})
  }

  return {unsafe, handlers}
}

function handler(matter) {
  var open = fence(matter, 'open')
  var close = fence(matter, 'close')

  return handle

  function handle(node) {
    return open + (node.value ? '\n' + node.value : '') + '\n' + close
  }
}

function fence(matter, prop) {
  var marker

  if (matter.marker) {
    marker = pick(matter.marker, prop)
    return marker + marker + marker
  }

  return pick(matter.fence, prop)
}

function pick(schema, prop) {
  return typeof schema === 'string' ? schema : schema[prop]
}
