declare module "papaparse" {
  export interface ParseConfig {
    delimiter?: string
    newline?: string
    quoteChar?: string
    escapeChar?: string
    header?: boolean
    dynamicTyping?: boolean
    preview?: number
    encoding?: string
    worker?: boolean
    comments?: boolean | string
    download?: boolean
    skipEmptyLines?: boolean | "greedy"
    fastMode?: boolean
    withCredentials?: boolean
    delimitersToGuess?: string[]
    chunk?: (results: ParseResult, parser: Parser) => void
    complete?: (results: ParseResult, file: File) => void
    error?: (error: Error, file: File) => void
    transform?: (value: string, field: string | number) => any
    transformHeader?: (header: string, index: number) => string
  }

  export interface ParseResult {
    data: any[]
    errors: Array<{
      type: string
      code: string
      message: string
      row: number
    }>
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      truncated: boolean
      cursor: number
    }
  }

  export interface Parser {
    abort: () => void
  }

  export interface UnparseConfig {
    quotes?: boolean | boolean[]
    quoteChar?: string
    escapeChar?: string
    delimiter?: string
    header?: boolean
    newline?: string
    skipEmptyLines?: boolean
    columns?: string[] | { [key: string]: string }
  }

  export function parse(csv: string, config?: ParseConfig): ParseResult
  export function parse(file: File, config?: ParseConfig): void
  export function unparse(data: any, config?: UnparseConfig): string
}
