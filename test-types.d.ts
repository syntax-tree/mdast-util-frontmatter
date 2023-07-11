import type {Literal} from 'mdast'

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
  interface RootContentMap {
    custom: Custom
    json: Json
    toml: Toml
  }

  interface FrontmatterContentMap {
    custom: Custom
    json: Json
    toml: Toml
  }
}
