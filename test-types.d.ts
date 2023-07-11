import type {Literal} from 'mdast'

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Toml extends Literal {
  type: 'toml'
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Json extends Literal {
  type: 'json'
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface Custom extends Literal {
  type: 'custom'
}

declare module 'mdast' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface RootContentMap {
    custom: Custom
    json: Json
    toml: Toml
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface FrontmatterContentMap {
    custom: Custom
    json: Json
    toml: Toml
  }
}
