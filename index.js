import matters from 'micromark-extension-frontmatter/lib/matters.js'

export function frontmatterFromMarkdown(options) {
  const settings = matters(options)
  const enter = {}
  const exit = {}
  let index = -1

  while (++index < settings.length) {
    const matter = settings[index]
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
  const data = this.resume()
  // Remove the initial and final eol.
  this.exit(token).value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, '')
}

function value(token) {
  this.config.enter.data.call(this, token)
  this.config.exit.data.call(this, token)
}

export function frontmatterToMarkdown(options) {
  const unsafe = []
  const handlers = {}
  const settings = matters(options)
  let index = -1

  while (++index < settings.length) {
    const matter = settings[index]
    handlers[matter.type] = handler(matter)
    unsafe.push({atBreak: true, character: fence(matter, 'open').charAt(0)})
  }

  return {unsafe, handlers}
}

function handler(matter) {
  const open = fence(matter, 'open')
  const close = fence(matter, 'close')

  return handle

  function handle(node) {
    return open + (node.value ? '\n' + node.value : '') + '\n' + close
  }
}

function fence(matter, prop) {
  return matter.marker
    ? pick(matter.marker, prop).repeat(3)
    : pick(matter.fence, prop)
}

function pick(schema, prop) {
  return typeof schema === 'string' ? schema : schema[prop]
}
