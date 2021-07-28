import {Literal} from 'mdast'

interface TOML extends Literal {
  type: 'toml'
}

interface JSON extends Literal {
  type: 'json'
}

interface Custom extends Literal {
  type: 'custom'
}

declare module 'mdast' {
  // To do: this should be `FrontmatterMap`, which doesn’t exist yet.
  interface BlockContentMap {
    toml: TOML
    custom: Custom
    json: JSON
  }
}
