declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY?: string
    GEMINI_API_KEY?: string
    NEXT_PUBLIC_GEMINI_API_KEY?: string
    NEXT_PUBLIC_ANTHROPIC_API_KEY?: string
  }
}
