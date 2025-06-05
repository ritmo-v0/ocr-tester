export interface TestResult {
  id: string
  provider?: string
  model?: string
  fullModelName?: string // 添加完整模型名稱字段
  extractedText: string
  accuracy: number
  apiResponse?: any
}

export interface TestVersion {
  id: string
  versionNumber: number // 添加版本號字段
  timestamp: string
  systemPrompt: string
  userPrompt?: string
  model: string
  temperature: number
  maxTokens: number
  provider?: string
  results: TestResult[]
}

export interface ModelConfig {
  provider: string
  model: string
  enabled: boolean
}

export interface TestCaseData {
  id: string
  imageUrl: string
  expectedText: string
  systemPrompt: string
  model: string
  temperature: number
  maxTokens: number
  apiEndpoint: string
  apiKey: string
  versions: TestVersion[]
}

export interface OcrTestingState {
  imageUrl: string
  groundTruth: string
  versions: TestVersion[]
  modelConfigs: ModelConfig[]
  activeVersionId: string | null
  testCases: TestCaseData[]
  nextVersionNumber: number // 添加下一個版本號的追踪
}
