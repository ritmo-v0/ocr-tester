declare module "diff" {
  export interface Change {
    count?: number
    value: string
    added?: boolean
    removed?: boolean
  }

  export function diffWords(
    oldStr: string,
    newStr: string,
    options?: {
      ignoreWhitespace?: boolean
      ignoreCase?: boolean
    },
  ): Change[]

  export function diffChars(
    oldStr: string,
    newStr: string,
    options?: {
      ignoreCase?: boolean
    },
  ): Change[]

  export function diffLines(
    oldStr: string,
    newStr: string,
    options?: {
      ignoreWhitespace?: boolean
      newlineIsToken?: boolean
      callback?: (err: Error, changes: Change[]) => void
    },
  ): Change[]

  export function diffSentences(
    oldStr: string,
    newStr: string,
    options?: {
      ignoreWhitespace?: boolean
      newlineIsToken?: boolean
    },
  ): Change[]

  export function diffCss(oldStr: string, newStr: string): Change[]

  export function diffJson(oldObj: object, newObj: object): Change[]

  export function createPatch(
    fileName: string,
    oldStr: string,
    newStr: string,
    oldHeader?: string,
    newHeader?: string,
  ): string

  export function applyPatch(source: string, patch: string | object[]): string

  export function convertChangesToXML(changes: Change[]): string

  export function convertChangesToDMP(changes: Change[]): Array<[number, string]>
}
