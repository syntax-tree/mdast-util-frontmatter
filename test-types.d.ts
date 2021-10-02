import {Literal} from 'mdast'

interface Toml extends Literal {
  type: 'toml'
}

interface Json extends Literal {
  type: 'json'
}

interface Custom extends Literal {
  type: 'custom'
}

declare module 'mdast' {
  interface FrontmatterContentMap {
    toml: Toml
    custom: Custom
    json: Json
  }
}
