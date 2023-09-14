/**
 * @typedef {import('./test-types.js')} DoNotTouchThisIncludesCustomNodesInTree
 */

import assert from 'node:assert/strict'
import test from 'node:test'
import {frontmatter} from 'micromark-extension-frontmatter'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {
  frontmatterFromMarkdown,
  frontmatterToMarkdown
} from 'mdast-util-frontmatter'
import {toMarkdown} from 'mdast-util-to-markdown'
import {removePosition} from 'unist-util-remove-position'

const custom = {type: 'custom', marker: {open: '<', close: '>'}}
const json = {type: 'json', fence: {open: '{', close: '}'}}
const yamlAnywhere = {type: 'yaml', marker: '-', anywhere: true}

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(
      Object.keys(await import('mdast-util-frontmatter')).sort(),
      ['frontmatterFromMarkdown', 'frontmatterToMarkdown']
    )
  })
})

test('frontmatterFromMarkdown', async function (t) {
  await t.test(
    'should not support a single yaml fence (thematic break)',
    async function () {
      const tree = fromMarkdown('---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}]
      })
    }
  )

  await t.test('should parse empty yaml', async function () {
    const tree = fromMarkdown('---\n---', {
      extensions: [frontmatter()],
      mdastExtensions: [frontmatterFromMarkdown()]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'yaml', value: ''}]
    })
  })

  await t.test(
    'should not support a prefix (indent) before a yaml opening fence',
    async function () {
      const tree = fromMarkdown(' ---\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
      })
    }
  )

  await t.test(
    'should not support a prefix (indent) before a yaml closing fence',
    async function () {
      const tree = fromMarkdown('---\n ---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
      })
    }
  )

  await t.test(
    'should parse an arbitrary suffix after the opening and closing fence of yaml',
    async function () {
      const tree = fromMarkdown('---  \n---\t ', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'yaml', value: ''}]
      })
    }
  )

  await t.test(
    'should not support other characters after the suffix on the opening fence of yaml',
    async function () {
      const tree = fromMarkdown('--- --\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
      })
    }
  )

  await t.test(
    'should not support other characters after the suffix on the closing fence of yaml',
    async function () {
      const tree = fromMarkdown('---\n--- x', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: '--- x'}]}
        ]
      })
    }
  )

  await t.test(
    'should not support an opening yaml fence of more than 3 characters',
    async function () {
      const tree = fromMarkdown('----\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
      })
    }
  )

  await t.test(
    'should not support a closing yaml fence of more than 3 characters',
    async function () {
      const tree = fromMarkdown('---\n----', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [{type: 'thematicBreak'}, {type: 'thematicBreak'}]
      })
    }
  )

  await t.test(
    'should not support an opening yaml fence of less than 3 characters',
    async function () {
      const tree = fromMarkdown('--\n---', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {type: 'heading', depth: 2, children: [{type: 'text', value: '--'}]}
        ]
      })
    }
  )

  await t.test(
    'should not support a closing yaml fence of less than 3 characters',
    async function () {
      const tree = fromMarkdown('---\n--', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: '--'}]}
        ]
      })
    }
  )

  await t.test('should support content in yaml', async function () {
    const tree = fromMarkdown('---\na\nb\n---', {
      extensions: [frontmatter()],
      mdastExtensions: [frontmatterFromMarkdown()]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'yaml', value: 'a\nb'}]
    })
  })

  await t.test('should support blank lines in yaml', async function () {
    const tree = fromMarkdown('---\na\n\nb\n---', {
      extensions: [frontmatter()],
      mdastExtensions: [frontmatterFromMarkdown()]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'yaml', value: 'a\n\nb'}]
    })
  })

  await t.test('should support toml', async function () {
    const tree = fromMarkdown('+++\na\n\nb\n+++', {
      extensions: [frontmatter('toml')],
      mdastExtensions: [frontmatterFromMarkdown('toml')]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'toml', value: 'a\n\nb'}]
    })
  })

  await t.test('should support a custom matter (1)', async function () {
    const tree = fromMarkdown('<<<\na\n\nb\n>>>', {
      extensions: [frontmatter(custom)],
      mdastExtensions: [frontmatterFromMarkdown(custom)]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'custom', value: 'a\n\nb'}]
    })
  })

  await t.test('should support a custom matter (2)', async function () {
    const tree = fromMarkdown('{\na\n\nb\n}', {
      extensions: [frontmatter(json)],
      mdastExtensions: [frontmatterFromMarkdown(json)]
    })

    removePosition(tree, {force: true})

    assert.deepEqual(tree, {
      type: 'root',
      children: [{type: 'json', value: 'a\n\nb'}]
    })
  })

  await t.test(
    'should not support yaml frontmatter in the middle',
    async function () {
      const tree = fromMarkdown('# Hello\n---\na\n\nb\n---\n+++', {
        extensions: [frontmatter()],
        mdastExtensions: [frontmatterFromMarkdown()]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{type: 'text', value: 'Hello'}]
          },
          {type: 'thematicBreak'},
          {type: 'paragraph', children: [{type: 'text', value: 'a'}]},
          {type: 'heading', depth: 2, children: [{type: 'text', value: 'b'}]},
          {type: 'paragraph', children: [{type: 'text', value: '+++'}]}
        ]
      })
    }
  )

  await t.test(
    'should not support custom matters in the middle',
    async function () {
      const tree = fromMarkdown('# Hello\n---\na\n\nb\n---\n+++', {
        extensions: [frontmatter(yamlAnywhere)],
        mdastExtensions: [frontmatterFromMarkdown(yamlAnywhere)]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {
            type: 'heading',
            depth: 1,
            children: [{type: 'text', value: 'Hello'}]
          },
          {type: 'yaml', value: 'a\n\nb'},
          {type: 'paragraph', children: [{type: 'text', value: '+++'}]}
        ]
      })
    }
  )

  await t.test(
    'should support regexp special characters as markers',
    async function () {
      const funky = {type: 'funky', marker: '*'}
      const tree = fromMarkdown('***\na\n***\n\n*a', {
        extensions: [frontmatter(funky)],
        mdastExtensions: [frontmatterFromMarkdown(funky)]
      })

      removePosition(tree, {force: true})

      assert.deepEqual(tree, {
        type: 'root',
        children: [
          {type: 'funky', value: 'a'},
          {type: 'paragraph', children: [{type: 'text', value: '*a'}]}
        ]
      })

      assert.deepEqual(
        toMarkdown(tree, {extensions: [frontmatterToMarkdown(funky)]}),
        '***\na\n***\n\n\\*a\n'
      )
    }
  )
})

test('frontmatterToMarkdown', async function (t) {
  await t.test('should serialize empty yaml', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'yaml', value: ''}]},
        {extensions: [frontmatterToMarkdown()]}
      ),
      '---\n---\n'
    )
  })

  await t.test('should support content in yaml', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'yaml', value: 'a\nb'}]},
        {extensions: [frontmatterToMarkdown()]}
      ),
      '---\na\nb\n---\n'
    )
  })

  await t.test('should support blank lines in yaml', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'yaml', value: 'a\n\nb'}]},
        {extensions: [frontmatterToMarkdown()]}
      ),
      '---\na\n\nb\n---\n'
    )
  })

  await t.test('should support blank lines in yaml', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'toml', value: 'a\n\nb'}]},
        {extensions: [frontmatterToMarkdown('toml')]}
      ),
      '+++\na\n\nb\n+++\n'
    )
  })

  await t.test('should support a custom matter (1)', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'custom', value: 'a\n\nb'}]},
        {extensions: [frontmatterToMarkdown(custom)]}
      ),
      '<<<\na\n\nb\n>>>\n'
    )
  })

  await t.test('should support a custom matter (2)', async function () {
    assert.deepEqual(
      toMarkdown(
        {type: 'root', children: [{type: 'json', value: 'a\n\nb'}]},
        {extensions: [frontmatterToMarkdown(json)]}
      ),
      '{\na\n\nb\n}\n'
    )
  })

  await t.test(
    'should escape what would otherwise be custom matter',
    async function () {
      assert.deepEqual(
        toMarkdown(
          {type: 'root', children: [{type: 'text', value: '<<<\na\n\nb\n>>>'}]},
          {extensions: [frontmatterToMarkdown(custom)]}
        ),
        '\\<<<\na\n\nb\n\\>>>\n'
      )
    }
  )
})
