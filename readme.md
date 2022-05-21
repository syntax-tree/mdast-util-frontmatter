# mdast-util-frontmatter

[![Build][build-badge]][build]
[![Coverage][coverage-badge]][coverage]
[![Downloads][downloads-badge]][downloads]
[![Size][size-badge]][size]
[![Sponsors][sponsors-badge]][collective]
[![Backers][backers-badge]][collective]
[![Chat][chat-badge]][chat]

[mdast][] extensions to parse and serialize frontmatter (YAML, TOML, and more).

## Contents

*   [What is this?](#what-is-this)
*   [When to use this](#when-to-use-this)
*   [Install](#install)
*   [Use](#use)
*   [API](#api)
    *   [`frontmatterFromMarkdown(options?)`](#frontmatterfrommarkdownoptions)
    *   [`frontmatterToMarkdown(options?)`](#frontmattertomarkdownoptions)
*   [Syntax tree](#syntax-tree)
    *   [Nodes](#nodes)
    *   [Content model](#content-model)
*   [Types](#types)
*   [Compatibility](#compatibility)
*   [Related](#related)
*   [Contribute](#contribute)
*   [License](#license)

## What is this?

This package contains extensions that add support for the frontmatter syntax
enabled by GitHub and many other places to
[`mdast-util-from-markdown`][mdast-util-from-markdown] and
[`mdast-util-to-markdown`][mdast-util-to-markdown].

Frontmatter is a metadata format in front of content.
It’s typically written in YAML and is often used with markdown.
Frontmatter does not work everywhere so it makes markdown less portable.

## When to use this

These tools are all rather low-level.
In most cases, you’d want to use [`remark-frontmatter`][remark-frontmatter] with
remark instead.

When working with `mdast-util-from-markdown`, you must combine this package with
[`micromark-extension-frontmatter`][extension].

## Install

This package is [ESM only][esm].
In Node.js (version 12.20+, 14.14+, or 16.0+), install with [npm][]:

```sh
npm install mdast-util-frontmatter
```

In Deno with [`esm.sh`][esmsh]:

```js
import {frontmatterFromMarkdown, frontmatterToMarkdown} from 'https://esm.sh/mdast-util-frontmatter@1'
```

In browsers with [`esm.sh`][esmsh]:

```html
<script type="module">
  import {frontmatterFromMarkdown, frontmatterToMarkdown} from 'https://esm.sh/mdast-util-frontmatter@1?bundle'
</script>
```

## Use

Say our document `example.md` contains:

```markdown
+++
title = "New Website"
+++

# Other markdown
```

…and our module `example.js` looks as follows:

```js
import fs from 'node:fs/promises'
import {fromMarkdown} from 'mdast-util-from-markdown'
import {toMarkdown} from 'mdast-util-to-markdown'
import {frontmatter} from 'micromark-extension-frontmatter'
import {frontmatterFromMarkdown, frontmatterToMarkdown} from 'mdast-util-frontmatter'

const doc = await fs.readFile('example.md')

const tree = fromMarkdown(doc, {
  extensions: [frontmatter(['yaml', 'toml'])],
  mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])]
})

console.log(tree)

const out = toMarkdown(tree, {extensions: [frontmatterToMarkdown(['yaml', 'toml'])]})

console.log(out)
```

…now running `node example.js` yields (positional info removed for brevity):

```js
{
  type: 'root',
  children: [
    {type: 'toml', value: 'title = "New Website"'},
    {
      type: 'heading',
      depth: 1,
      children: [{type: 'text', value: 'Other markdown'}]
    }
  ]
}
```

```markdown
+++
title = "New Website"
+++

# Other markdown
```

## API

This package exports the identifiers `frontmatterFromMarkdown` and
`frontmatterToMarkdown`.
There is no default export.

### `frontmatterFromMarkdown(options?)`

Function that can be called to get an extension for
[`mdast-util-from-markdown`][mdast-util-from-markdown].

###### `options`

Configuration (optional).
Same as [`micromark-extension-frontmatter`][options].

### `frontmatterToMarkdown(options?)`

Function that can be called to get an extension for
[`mdast-util-to-markdown`][mdast-util-to-markdown].

###### `options`

Configuration (optional).
Same as [`micromark-extension-frontmatter`][options].

## Syntax tree

The following interfaces are added to **[mdast][]** by this utility.

### Nodes

> 👉 **Note**: other nodes are not enabled by default, but when passing options
> to enable them, they work the same as YAML.

#### `YAML`

```idl
interface YAML <: Literal {
  type: "yaml"
}
```

**YAML** ([**Literal**][dfn-literal]) represents a collection of metadata for
the document in the YAML data serialisation language.

**YAML** can be used where [**frontmatter**][dfn-frontmatter-content] content is
expected.
Its content is represented by its `value` field.

For example, the following markdown:

```markdown
---
foo: bar
---
```

Yields:

```js
{type: 'yaml', value: 'foo: bar'}
```

### Content model

#### `FrontmatterContent`

```idl
type FrontmatterContent = YAML
```

**Frontmatter** content represent out-of-band information about the document.

If frontmatter is present, it must be limited to one node in the
[*tree*][term-tree], and can only exist as a [*head*][term-head].

#### `FlowContent` (frontmatter)

```idl
type FlowContentFrontmatter = FrontmatterContent | FlowContent
```

## Types

This package is fully typed with [TypeScript][].
It exports the additional types `Options`, `Matter`, and `Info`.

The YAML node type is supported in `@types/mdast` by default.
To add other node types, register them by adding them to
`FrontmatterContentMap`:

```ts
import type {Literal} from 'mdast'

interface TOML extends Literal {
  type: 'toml'
}

declare module 'mdast' {
  interface FrontmatterContentMap {
    // Allow using TOML nodes defined by `mdast-util-frontmatter`.
    toml: TOML
  }
}
```

## Compatibility

Projects maintained by the unified collective are compatible with all maintained
versions of Node.js.
As of now, that is Node.js 12.20+, 14.14+, and 16.0+.
Our projects sometimes work with older versions, but this is not guaranteed.

This plugin works with `mdast-util-from-markdown` version 1+ and
`mdast-util-to-markdown` version 1+.

## Related

*   [`remarkjs/remark-frontmatter`][remark-frontmatter]
    — remark plugin to support frontmatter
*   [`micromark/micromark-extension-frontmatter`][extension]
    — micromark extension to parse frontmatter

## Contribute

See [`contributing.md`][contributing] in [`syntax-tree/.github`][health] for
ways to get started.
See [`support.md`][support] for ways to get help.

This project has a [code of conduct][coc].
By interacting with this repository, organization, or community you agree to
abide by its terms.

## License

[MIT][license] © [Titus Wormer][author]

<!-- Definitions -->

[build-badge]: https://github.com/syntax-tree/mdast-util-frontmatter/workflows/main/badge.svg

[build]: https://github.com/syntax-tree/mdast-util-frontmatter/actions

[coverage-badge]: https://img.shields.io/codecov/c/github/syntax-tree/mdast-util-frontmatter.svg

[coverage]: https://codecov.io/github/syntax-tree/mdast-util-frontmatter

[downloads-badge]: https://img.shields.io/npm/dm/mdast-util-frontmatter.svg

[downloads]: https://www.npmjs.com/package/mdast-util-frontmatter

[size-badge]: https://img.shields.io/bundlephobia/minzip/mdast-util-frontmatter.svg

[size]: https://bundlephobia.com/result?p=mdast-util-frontmatter

[sponsors-badge]: https://opencollective.com/unified/sponsors/badge.svg

[backers-badge]: https://opencollective.com/unified/backers/badge.svg

[collective]: https://opencollective.com/unified

[chat-badge]: https://img.shields.io/badge/chat-discussions-success.svg

[chat]: https://github.com/syntax-tree/unist/discussions

[npm]: https://docs.npmjs.com/cli/install

[esm]: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c

[esmsh]: https://esm.sh

[typescript]: https://www.typescriptlang.org

[license]: license

[author]: https://wooorm.com

[health]: https://github.com/syntax-tree/.github

[contributing]: https://github.com/syntax-tree/.github/blob/main/contributing.md

[support]: https://github.com/syntax-tree/.github/blob/main/support.md

[coc]: https://github.com/syntax-tree/.github/blob/main/code-of-conduct.md

[mdast]: https://github.com/syntax-tree/mdast

[remark-frontmatter]: https://github.com/remarkjs/remark-frontmatter

[mdast-util-from-markdown]: https://github.com/syntax-tree/mdast-util-from-markdown

[mdast-util-to-markdown]: https://github.com/syntax-tree/mdast-util-to-markdown

[extension]: https://github.com/micromark/micromark-extension-frontmatter

[options]: https://github.com/micromark/micromark-extension-frontmatter#options

[dfn-literal]: https://github.com/syntax-tree/mdast#literal

[dfn-frontmatter-content]: #frontmattercontent

[term-tree]: https://github.com/syntax-tree/unist#tree

[term-head]: https://github.com/syntax-tree/unist#head
