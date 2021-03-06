import test from 'tape'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'
import {frontmatter} from 'micromark-extension-frontmatter'
import {frontmatterFromMarkdown, frontmatterToMarkdown} from './index.js'

const custom = {type: 'custom', marker: {open: '<', close: '>'}}
const json = {type: 'json', fence: {open: '{', close: '}'}}
const yamlAnywhere = {type: 'yaml', marker: '-', anywhere: true}

test('markdown -> mdast', (t) => {
  t.deepEqual(
    removePosition(
      fromMarkdown('---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'thematicBreak'}]},
    'should not support a single yaml fence (thematic break)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: ''}]},
    'should parse empty yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown(' ---\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: ''}]},
    'should parse an arbitrary suffix after the opening and closing fence of yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('--- --\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: 'a\nb'}]},
    'should support content in yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('---\na\n\nb\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      }),
      true
    ),
    {type: 'root', children: [{type: 'yaml', value: 'a\n\nb'}]},
    'should support blank lines in yaml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('+++\na\n\nb\n+++', {
        extensions: [frontmatter('toml')],
        mdastExtensions: [frontmatterFromMarkdown('toml')]
      }),
      true
    ),
    {type: 'root', children: [{type: 'toml', value: 'a\n\nb'}]},
    'should support toml'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('<<<\na\n\nb\n>>>', {
        extensions: [frontmatter(custom)],
        mdastExtensions: [frontmatterFromMarkdown(custom)]
      }),
      true
    ),
    {type: 'root', children: [{type: 'custom', value: 'a\n\nb'}]},
    'should support a custom matter (1)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('{\na\n\nb\n}', {
        extensions: [frontmatter(json)],
        mdastExtensions: [frontmatterFromMarkdown(json)]
      }),
      true
    ),
    {type: 'root', children: [{type: 'json', value: 'a\n\nb'}]},
    'should support a custom matter (2)'
  )

  t.deepEqual(
    removePosition(
      fromMarkdown('# Hello\n---\na\n\nb\n---\n+++', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
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
        extensions: [frontmatter(yamlAnywhere)],
        mdastExtensions: [frontmatterFromMarkdown(yamlAnywhere)]
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

test('mdast -> markdown', (t) => {
  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: ''}]},
      {extensions: [frontmatterToMarkdown()]}
    ),
    '---\n---\n',
    'should serialize empty yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: 'a\nb'}]},
      {extensions: [frontmatterToMarkdown()]}
    ),
    '---\na\nb\n---\n',
    'should support content in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'yaml', value: 'a\n\nb'}]},
      {extensions: [frontmatterToMarkdown()]}
    ),
    '---\na\n\nb\n---\n',
    'should support blank lines in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'toml', value: 'a\n\nb'}]},
      {extensions: [frontmatterToMarkdown('toml')]}
    ),
    '+++\na\n\nb\n+++\n',
    'should support blank lines in yaml'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'custom', value: 'a\n\nb'}]},
      {extensions: [frontmatterToMarkdown(custom)]}
    ),
    '<<<\na\n\nb\n>>>\n',
    'should support a custom matter (1)'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'json', value: 'a\n\nb'}]},
      {extensions: [frontmatterToMarkdown(json)]}
    ),
    '{\na\n\nb\n}\n',
    'should support a custom matter (2)'
  )

  t.deepEqual(
    toMarkdown(
      {type: 'root', children: [{type: 'text', value: '<<<\na\n\nb\n>>>'}]},
      {extensions: [frontmatterToMarkdown(custom)]}
    ),
    '\\<<<\na\n\nb\n\\>>>\n',
    'should escape what would otherwise be custom matter'
  )

  t.end()
})
