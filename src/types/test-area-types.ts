import type { TestVersion } from "./ocr-types"

export interface TestArea {
  name: string
  imageUrl: string
  groundTruth: string
}

export interface TestAreaWithData extends TestArea {
  id: string
  createdAt: string
  updatedAt: string
  versions: TestVersion[]
  activeVersionId: string | null
}
