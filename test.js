var test = require('tape')
var fromMarkdown = require('mdast-util-from-markdown')
var toMarkdown = require('mdast-util-to-markdown')
var removePosition = require('unist-util-remove-position')
var syntax = require('micromark-extension-frontmatter')
var frontmatter = require('.')

var custom = {type: 'custom', marker: {open: '<', close: '>'}}
var json = {type: 'json', fence: {open: '{', close: '}'}}
var yamlAnywhere = {type: 'yaml', marker: '-', anywhere: true}

test('markdown -> mdast', function (t) {
  t.deepEqual(
    removePosition(
      fromMarkdown('---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'thematicBreak'}]},
    'should not support a single yaml fence (thematic break)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: ''}]},
    'should parse empty yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown(' ---\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
    },
    'should not support a prefix (indent) before a yaml opening fence'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n ---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
    },
    'should not support a prefix (indent) before a yaml closing fence'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---  \n---\t ', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: ''}]},
    'should parse an arbitrary suffix after the opening and closing fence of yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('--- --\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
    },
    'should not support other characters after the suffix on the opening fence of yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n--- x', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {type: 'thematicBreak'},
        {type: 'paragraph', children: [{type: 'text', value: '--- x'}]}
      ]
    },
    'should not support other characters after the suffix on the closing fence of yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('----\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
    },
    'should not support an opening yaml fence of more than 3 characters'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n----', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
    },
    'should not support a closing yaml fence of more than 3 characters'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('--\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {type: 'heading', depth: 2, children: [{type: 'text', value: '--'}]}
      ]
    },
    'should not support an opening yaml fence of less than 3 characters'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n--', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {type: 'thematicBreak'},
        {type: 'paragraph', children: [{type: 'text', value: '--'}]}
      ]
    },
    'should not support a closing yaml fence of less than 3 characters'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\na\nb\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: 'a\nb'}]},
    'should support content in yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\na\n\nb\n---', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: 'a\n\nb'}]},
    'should support blank lines in yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('+++\na\n\nb\n+++', {
        extensions: [syntax('toml')],
        mdastExtensions: [frontmatter.fromMarkdown('toml')]
      }),
      true
    ),
    {type: 'root', children: [{type: 'toml', value: 'a\n\nb'}]},
    'should support toml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('<<<\na\n\nb\n>>>', {
        extensions: [syntax(custom)],
        mdastExtensions: [frontmatter.fromMarkdown(custom)]
      }),
      true
    ),
    {type: 'root', children: [{type: 'custom', value: 'a\n\nb'}]},
    'should support a custom matter (1)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{\na\n\nb\n}', {
        extensions: [syntax(json)],
        mdastExtensions: [frontmatter.fromMarkdown(json)]
      }),
      true
    ),
    {type: 'root', children: [{type: 'json', value: 'a\n\nb'}]},
    'should support a custom matter (2)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('# Hello\n---\na\n\nb\n---\n+++', {
        extensions: [syntax()],
        mdastExtensions: [frontmatter.fromMarkdown()]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {type: 'heading', depth: 1, children: [{type: 'text', value: 'Hello'}]},
        {type: 'thematicBreak'},
        {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
        {type: 'heading', depth: 2, children: [{type: 'text', value: 'b'}]},
        {type: 'paragraph', children: [{type: 'text', value: '+++'}]}
      ]
    },
    'should not support yaml frontmatter in the middle'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('# Hello\n---\na\n\nb\n---\n+++', {
        extensions: [syntax(yamlAnywhere)],
        mdastExtensions: [frontmatter.fromMarkdown(yamlAnywhere)]
      }),
      true
    ),
    {
      type: 'root',
      children: [
        {type: 'heading', depth: 1, children: [{type: 'text', value: 'Hello'}]},
        {type: 'yaml', value: 'a\n\nb'},
        {type: 'paragraph', children: [{type: 'text', value: '+++'}]}
      ]
    },
    'should not support custom matters in the middle'
  )

  t.end()
})

test('mdast -> markdown', function (t) {
  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: ''}]},
      {extensions: [frontmatter.toMarkdown()]}
    ),
    '---\n---',
    'should serialize empty yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: 'a\nb'}]},
      {extensions: [frontmatter.toMarkdown()]}
    ),
    '---\na\nb\n---',
    'should support content in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: 'a\n\nb'}]},
      {extensions: [frontmatter.toMarkdown()]}
    ),
    '---\na\n\nb\n---',
    'should support blank lines in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'toml', value: 'a\n\nb'}]},
      {extensions: [frontmatter.toMarkdown('toml')]}
    ),
    '+++\na\n\nb\n+++',
    'should support blank lines in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'custom', value: 'a\n\nb'}]},
      {extensions: [frontmatter.toMarkdown(custom)]}
    ),
    '<<<\na\n\nb\n>>>',
    'should support a custom matter (1)'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'json', value: 'a\n\nb'}]},
      {extensions: [frontmatter.toMarkdown(json)]}
    ),
    '{\na\n\nb\n}',
    'should support a custom matter (2)'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'text', value: '<<<\na\n\nb\n>>>'}]},
      {extensions: [frontmatter.toMarkdown(custom)]}
    ),
    '\\<<<\na\n\nb\n\\>>>',
    'should escape what would otherwise be custom matter'
  )

  t.end()
})
