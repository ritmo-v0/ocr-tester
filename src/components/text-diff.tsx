"use client"

import { useMemo } from "react"

// 添加 diff 模塊的類型定義
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
}

import { diffWords } from "diff"

interface TextDiffProps {
  original: string
  modified: string
  ignoreLatexSymbols?: boolean
}

// 修改 cleanLatexForComparison 函数，增强对LaTeX特殊字符的处理

// 将现有的 cleanLatexForComparison 函数替换为以下更完善的版本：
export function cleanLatexForComparison(text: string): string {
  if (!text) return ""

  // 移除 LaTeX 数学环境标记
  let cleanedText = text
    .replace(/\$\$/g, "") // 移除 $$
    .replace(/\$/g, "") // 移除 $
    .replace(/\\\[/g, "") // 移除 \[
    .replace(/\\\]/g, "") // 移除 \]
    .replace(/\\\(/g, "") // 移除 \(
    .replace(/\\\)/g, "") // 移除 \)

  // 移除 LaTeX 结构命令
  cleanedText = cleanedText.replace(
    /\\(section|subsection|chapter|paragraph|subparagraph|part|title)\*?(\{[^}]*\})/g,
    "$2",
  )

  // 移除常见的 LaTeX 数学模式命令
  cleanedText = cleanedText.replace(
    /\\(text|mathbf|mathrm|mathcal|mathit|mathbb|mathsf|boldsymbol|vec|hat|bar|tilde)(\{[^}]*\})/g,
    "$2",
  )

  // 移除格式命令
  cleanedText = cleanedText.replace(/\\(textbf|textit|underline|emph|texttt|textsf|textsc)(\{[^}]*\})/g, "$2")

  // 移除 LaTeX 环境标记
  cleanedText = cleanedText.replace(/\\begin\{[^}]*\}|\\end\{[^}]*\}/g, "")

  // 移除其他常见的 LaTeX 命令
  cleanedText = cleanedText.replace(/\\(label|ref|cite|footnote|includegraphics)(\{[^}]*\})/g, "")

  // 移除常见的数学运算符命令
  cleanedText = cleanedText.replace(/\\(frac|sqrt|sum|prod|int|lim|sup|inf|max|min)(\{[^}]*\}(\{[^}]*\})?)/g, "")

  // 移除空格相关命令
  cleanedText = cleanedText.replace(/\\(quad|qquad|hspace|vspace)(\{[^}]*\})?/g, " ")

  // 移除换行相关命令
  cleanedText = cleanedText.replace(/\\(newline|linebreak|break|noindent)/g, "")

  // 新增：移除所有的反斜杠命令，包括\subsection*{}等
  cleanedText = cleanedText.replace(/\\[a-zA-Z]+\*?/g, "")

  // 新增：移除所有的花括号
  cleanedText = cleanedText.replace(/[{}]/g, "")

  // 新增：移除所有的反斜杠
  cleanedText = cleanedText.replace(/\\/g, "")

  // 移除多余的空格
  cleanedText = cleanedText.replace(/\s+/g, " ").trim()

  return cleanedText
}

// 計算準確率，可選擇是否忽略 LaTeX 特殊字元
export function calculateAccuracy(expected: string, actual: string, ignoreLatexSymbols = false): number {
  if (!expected || !actual) return 0

  // 如果需要忽略 LaTeX 特殊字元，先清理文本
  const cleanedExpected = ignoreLatexSymbols ? cleanLatexForComparison(expected) : expected
  const cleanedActual = ignoreLatexSymbols ? cleanLatexForComparison(actual) : actual

  // 計算差異
  const differences = diffWords(cleanedExpected || "", cleanedActual || "")

  const totalChars = cleanedExpected.length
  const addedChars = differences.reduce((sum: number, part) => sum + (part.added ? part.value.length : 0), 0)
  const removedChars = differences.reduce((sum: number, part) => sum + (part.removed ? part.value.length : 0), 0)

  const errorChars = Math.max(addedChars, removedChars)
  return Math.max(0, 1 - errorChars / totalChars)
}

export function TextDiff({ original, modified, ignoreLatexSymbols = true }: TextDiffProps) {
  const differences = useMemo(() => {
    // 如果需要忽略 LaTeX 特殊字元，先清理文本
    const cleanedOriginal = ignoreLatexSymbols ? cleanLatexForComparison(original) : original
    const cleanedModified = ignoreLatexSymbols ? cleanLatexForComparison(modified) : modified

    return diffWords(cleanedOriginal || "", cleanedModified || "")
  }, [original, modified, ignoreLatexSymbols])

  const accuracy = useMemo(() => {
    return calculateAccuracy(original, modified, ignoreLatexSymbols)
  }, [original, modified, ignoreLatexSymbols])

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs">
        <div className="flex gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Added</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span>Removed</span>
          </div>
        </div>
        <div>
          Accuracy:{" "}
          <span
            className={`font-medium ${
              accuracy > 0.9 ? "text-green-600" : accuracy > 0.7 ? "text-amber-600" : "text-red-600"
            }`}
          >
            {(accuracy * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="p-2 bg-muted rounded-md whitespace-pre-wrap text-xs max-h-[200px] overflow-y-auto">
        {differences.map((part, index) => (
          <span
            key={index}
            className={`${
              part.added
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : part.removed
                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                  : ""
            }`}
          >
            {part.value}
          </span>
        ))}
      </div>
    </div>
  )
}
