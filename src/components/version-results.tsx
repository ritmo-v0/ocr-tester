"use client"

import { Button } from "@/components/ui/button"

// 添加以下類型定義在 import 部分的最上方，就在 import 語句之前

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

import { useState, useEffect, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	LabelList,
} from "recharts"
import { TextDiff, calculateAccuracy, cleanLatexForComparison } from "@/components/text-diff"
import { useTheme } from "next-themes"
import type { TestVersion, TestResult } from "@/types/ocr-types"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Info, Maximize2, FileText, FileCode, ChevronLeft, ChevronRight, Code } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
// import "katex/dist/katex.min.css"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

interface VersionResultsProps {
	version: TestVersion
	groundTruth: string
}

interface ModelStats {
	provider: string
	model: string
	results: TestResult[]
	average: number
	stdDev: number
	max: number
	count: number
}

// 修復不同格式的 LaTeX 文本
function fixKatex(text: string) {
	return text
		.replace(/\\$$(.*?)\\$$/g, "$$$1$$")
		.replace(/\\\[(.*?)\\\]/gs, "\n$$$$\n$1\n$$$$\n")
		.replace(/ *\$\$ (?!\n)([\s\S]*?)(?!\n\s*)\$\$ */g, "   $$$$\n   $1\n   $$$$")
}

export function VersionResults({ version, groundTruth }: VersionResultsProps) {
	const { theme } = useTheme()
	const isDarkTheme = theme === "dark"
	const [ignoreLatexCommands, setIgnoreLatexCommands] = useState(true)

	// Group results by model
	const modelGroups = useMemo(() => {
		const groups: Record<string, TestResult[]> = {}

		version.results.forEach((result) => {
			// 使用完整的 provider-model 作為 key
			const key = `${result.provider || "unknown"}-${result.model || "unknown"}`
			if (!groups[key]) {
				groups[key] = []
			}
			groups[key].push(result)
		})

		// Calculate statistics for each group
		const stats: ModelStats[] = Object.entries(groups).map(([key, results]) => {
			// 直接從結果中獲取 provider 和 model，而不是從 key 中分割
			const provider = results[0].provider || "unknown"
			const model = results[0].model || "unknown"

			// Calculate average
			const accuracies = results.map((r) => calculateAccuracy(groundTruth, r.extractedText, ignoreLatexCommands) * 100)
			const average = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length

			// Calculate standard deviation
			const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - average, 2), 0) / accuracies.length
			const stdDev = Math.sqrt(variance)

			// Find max
			const max = Math.max(...accuracies)

			return {
				provider,
				model,
				results,
				average,
				stdDev,
				max,
				count: results.length,
			}
		})

		// Sort by average accuracy (descending)
		return stats.sort((a, b) => b.average - a.average)
	}, [version.results, groundTruth, ignoreLatexCommands])

	// Set default selected model to the first one
	const [selectedModelKey, setSelectedModelKey] = useState<string>("")
	const [selectedRunIndex, setSelectedRunIndex] = useState<number>(0)
	const [dialogRunIndex, setDialogRunIndex] = useState<number>(0)

	useEffect(() => {
		if (modelGroups.length > 0) {
			setSelectedModelKey(`${modelGroups[0].provider}-${modelGroups[0].model}`)
			setSelectedRunIndex(0)
			setDialogRunIndex(0)
		}
	}, [modelGroups])

	const selectedModelGroup = useMemo(() => {
		return modelGroups.find((group) => `${group.provider}-${group.model}` === selectedModelKey)
	}, [modelGroups, selectedModelKey])

	// Prepare data for the chart
	const chartData = modelGroups.map((group) => ({
		name: `${group.provider}: ${group.model}`,
		accuracy: Number.parseFloat(group.average.toFixed(1)),
		provider: group.provider,
		model: group.model,
		fullName: `${group.provider}-${group.model}`,
		stdDev: Number.parseFloat(group.stdDev.toFixed(1)),
		max: Number.parseFloat(group.max.toFixed(1)),
	}))

	// 修改為使用靜態顏色而不是函數
	const openaiColor = "#10b981"
	const geminiColor = "#3b82f6"
	const defaultColor = "#888888"

	// 在 VersionResults 函數內部，添加這些狀態
	const [isDialogOpen, setIsDialogOpen] = useState(false)
	const [isMarkdownMode, setIsMarkdownMode] = useState(false)
	const [showRawText, setShowRawText] = useState(false)

	// 獲取當前選中的結果
	const selectedResult = selectedModelGroup?.results[selectedRunIndex] || null
	const dialogResult = selectedModelGroup?.results[dialogRunIndex] || null

	// 處理 run 切換
	const handlePrevRun = () => {
		if (selectedModelGroup && selectedRunIndex > 0) {
			setSelectedRunIndex(selectedRunIndex - 1)
		}
	}

	const handleNextRun = () => {
		if (selectedModelGroup && selectedRunIndex < selectedModelGroup.results.length - 1) {
			setSelectedRunIndex(selectedRunIndex + 1)
		}
	}

	const handleDialogPrevRun = () => {
		if (selectedModelGroup && dialogRunIndex > 0) {
			setDialogRunIndex(dialogRunIndex - 1)
		}
	}

	const handleDialogNextRun = () => {
		if (selectedModelGroup && dialogRunIndex < selectedModelGroup.results.length - 1) {
			setDialogRunIndex(dialogRunIndex + 1)
		}
	}

	// 當打開對話框時，同步 run 索引
	useEffect(() => {
		if (isDialogOpen) {
			setDialogRunIndex(selectedRunIndex)
		}
	}, [isDialogOpen, selectedRunIndex])

	return (
		<TooltipProvider>
			<div className="space-y-6">
				<div>
					<h2 className="text-xl font-bold mb-2">Version Results</h2>
					<div className="text-sm text-muted-foreground mb-4">{new Date(version.timestamp).toLocaleString()}</div>

					<div className="space-y-2">
						<h3 className="text-sm font-medium">System Prompt</h3>
						<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{version.systemPrompt}</div>
					</div>

					<div className="space-y-2 mt-4">
						<h3 className="text-sm font-medium">User Prompt</h3>
						<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{version.userPrompt}</div>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<Switch id="ignore-latex" checked={ignoreLatexCommands} onCheckedChange={setIgnoreLatexCommands} />
					<label
						htmlFor="ignore-latex"
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
					>
						忽略 LaTeX 命令進行比較
					</label>
					<Tooltip>
						<TooltipTrigger asChild>
							<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
						</TooltipTrigger>
						<TooltipContent className="max-w-sm">
							<p>
								啟用此選項將在計算準確率時忽略 LaTeX 命令和環境標記，如 \section、\text、\begin{"{...}"}
								、反斜杠、花括號等，只比較實際內容。
							</p>
						</TooltipContent>
					</Tooltip>
				</div>

				<Card className="bg-background border-border">
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle>Model Performance</CardTitle>
							<Tooltip>
								<TooltipTrigger asChild>
									<Info className="h-4 w-4 text-muted-foreground cursor-help" />
								</TooltipTrigger>
								<TooltipContent className="max-w-sm">
									<p>此圖表顯示各模型的平均準確率。準確率基於提取文本與預期文本的字符級差異計算。</p>
								</TooltipContent>
							</Tooltip>
						</div>
					</CardHeader>
					<CardContent className="p-4">
						<div className="h-[240px] w-full rounded-lg overflow-hidden bg-background">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }} barGap={40}>
									<CartesianGrid
										strokeDasharray="3 3"
										stroke={isDarkTheme ? "#333" : "#e5e5e5"}
										vertical={false}
										strokeOpacity={0.5}
									/>
									<XAxis
										dataKey="name"
										tick={{ fill: isDarkTheme ? "#fff" : "#333", fontSize: 12 }}
										axisLine={{ stroke: isDarkTheme ? "#444" : "#e5e5e5" }}
										tickLine={{ stroke: isDarkTheme ? "#444" : "#e5e5e5" }}
										dy={10}
									/>
									<YAxis
										domain={[0, 100]}
										tick={{ fill: isDarkTheme ? "#fff" : "#333", fontSize: 12 }}
										axisLine={{ stroke: isDarkTheme ? "#444" : "#e5e5e5" }}
										tickLine={{ stroke: isDarkTheme ? "#444" : "#e5e5e5" }}
										tickCount={5}
										dx={-10}
									/>
									<RechartsTooltip
										formatter={(value: number, name: string) => {
											if (name === "accuracy") return [`${value}%`, "Average"]
											if (name === "stdDev") return [`±${value}%`, "Std Dev"]
											if (name === "max") return [`${value}%`, "Max"]
											return [value, name]
										}}
										contentStyle={{
											backgroundColor: isDarkTheme ? "#1f1f1f" : "#fff",
											borderColor: isDarkTheme ? "#333" : "#e5e5e5",
											borderRadius: "6px",
											color: isDarkTheme ? "#fff" : "#333",
											padding: "8px 12px",
											boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
											fontSize: "12px",
										}}
										labelStyle={{
											color: isDarkTheme ? "#fff" : "#333",
											fontWeight: "bold",
											marginBottom: "4px",
										}}
									/>
									<Bar
										dataKey="accuracy"
										fill="#10b981"
										radius={[4, 4, 0, 0]}
										name="Accuracy"
										maxBarSize={60}
										animationDuration={800}
									>
										<LabelList
											dataKey="accuracy"
											position="top"
											formatter={(value: number) => `${value}%`}
											fill={isDarkTheme ? "#fff" : "#333"}
											style={{ fontSize: "12px", fontWeight: "500" }}
											offset={8}
										/>
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-medium">Model Results</h3>
						<Tooltip>
							<TooltipTrigger asChild>
								<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
							</TooltipTrigger>
							<TooltipContent className="max-w-sm">
								<p>點擊模型卡片查看詳細結果。準確率計算基於字符級差異，標準差(±)表示結果的一致性。</p>
							</TooltipContent>
						</Tooltip>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<div className="flex flex-wrap gap-2">
							{modelGroups.map((group) => (
								<div key={`${group.provider}-${group.model}`} className="flex-1 min-w-[200px]">
									<button
										className={`w-full p-3 rounded-md text-left ${`${group.provider}-${group.model}` === selectedModelKey
											? "bg-primary text-primary-foreground"
											: "bg-muted hover:bg-muted/80"
											}`}
										onClick={() => {
											setSelectedModelKey(`${group.provider}-${group.model}`)
											setSelectedRunIndex(0) // 重置 run 索引
										}}
									>
										<div className="font-medium">
											{group.provider}: {group.model}
										</div>
										<div className="flex items-center gap-2 mt-1">
											<Tooltip>
												<TooltipTrigger asChild>
													<Badge
														variant={group.average > 90 ? "success" : group.average > 70 ? "warning" : "destructive"}
													>
														{group.average.toFixed(1)}%
													</Badge>
												</TooltipTrigger>
												<TooltipContent>
													<p>平均準確率：基於提取文本與預期文本的字符級差異</p>
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<span className="text-xs">Min. {group.stdDev.toFixed(1)}%</span>
												</TooltipTrigger>
												<TooltipContent>
													<p>標準差：表示結果的一致性，數值越低表示結果越穩定</p>
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<span className="text-xs">Max: {group.max.toFixed(1)}%</span>
												</TooltipTrigger>
												<TooltipContent>
													<p>最高準確率：所有運行中達到的最佳結果</p>
												</TooltipContent>
											</Tooltip>

											<Tooltip>
												<TooltipTrigger asChild>
													<span className="text-xs ml-auto">{group.count} runs</span>
												</TooltipTrigger>
												<TooltipContent>
													<p>運行次數：模型測試的總次數</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</button>
								</div>
							))}
						</div>

						{selectedModelGroup && (
							<div className="space-y-4 mt-4">
								<Tabs defaultValue="diff">
									<TabsList>
										<TabsTrigger value="diff">Text Diff</TabsTrigger>
										<TabsTrigger value="extracted">Extracted Text</TabsTrigger>
										<TabsTrigger value="expected">Expected Text</TabsTrigger>
										<TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
									</TabsList>

									<TabsContent value="diff" className="pt-4">
										<div className="flex items-center gap-2 mb-2">
											<h4 className="text-sm font-medium">文本差異比較</h4>
											<Tooltip>
												<TooltipTrigger asChild>
													<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
												</TooltipTrigger>
												<TooltipContent>
													<p>
														綠色：模型添加的文本
														<br />
														紅色：模型遺漏的文本
														<br />
														準確率基於添加和遺漏的字符數量計算
													</p>
												</TooltipContent>
											</Tooltip>
										</div>
										<div className="max-h-[300px] overflow-y-auto">
											<div className="space-y-6">
												{selectedModelGroup.results.map((result, index) => (
													<div key={result.id} className="space-y-2">
														<div className="flex items-center justify-between">
															<h4 className="text-sm font-medium">Run {index + 1}</h4>
															<Badge
																variant={
																	calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100 > 90
																		? "success"
																		: calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100 >
																			70
																			? "warning"
																			: "destructive"
																}
															>
																{(
																	calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100
																).toFixed(1)}
																%
															</Badge>
														</div>
														<TextDiff
															original={groundTruth}
															modified={result.extractedText}
															ignoreLatexSymbols={ignoreLatexCommands}
														/>
													</div>
												))}
											</div>
										</div>
									</TabsContent>

									<TabsContent value="extracted" className="pt-4">
										<ScrollArea className="max-h-[300px] overflow-y-auto">
											<div className="space-y-6">
												{selectedModelGroup.results.map((result, index) => (
													<div key={result.id} className="space-y-2">
														<div className="flex items-center justify-between">
															<h4 className="text-sm font-medium">Run {index + 1}</h4>
															<Badge
																variant={
																	calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100 > 90
																		? "success"
																		: calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100 >
																			70
																			? "warning"
																			: "destructive"
																}
															>
																{(
																	calculateAccuracy(groundTruth, result.extractedText, ignoreLatexCommands) * 100
																).toFixed(1)}
																%
															</Badge>
														</div>
														<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
															{result.extractedText}
														</div>
													</div>
												))}
											</div>
										</ScrollArea>
									</TabsContent>

									<TabsContent value="expected" className="pt-4">
										<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{groundTruth}</div>
									</TabsContent>

									<TabsContent value="side-by-side" className="pt-4">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center gap-2">
												<h4 className="text-sm font-medium">左右對比</h4>
												<div className="flex items-center gap-1 ml-4">
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														onClick={handlePrevRun}
														disabled={selectedRunIndex === 0}
													>
														<ChevronLeft className="h-4 w-4" />
													</Button>
													<span className="text-sm font-medium">
														Run {selectedRunIndex + 1}/{selectedModelGroup.results.length}
													</span>
													<Button
														variant="outline"
														size="icon"
														className="h-7 w-7"
														onClick={handleNextRun}
														disabled={selectedRunIndex === selectedModelGroup.results.length - 1}
													>
														<ChevronRight className="h-4 w-4" />
													</Button>
												</div>
											</div>
											<Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(true)}>
												<Maximize2 className="h-4 w-4 mr-1" />
												全屏顯示
											</Button>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<h5 className="text-xs font-medium">模型輸出</h5>
												<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
													{selectedResult?.extractedText}
												</div>
											</div>
											<div className="space-y-2">
												<h5 className="text-xs font-medium">預期結果</h5>
												<div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
													{groundTruth}
												</div>
											</div>
										</div>
									</TabsContent>
								</Tabs>
							</div>
						)}
					</div>
				</div>
			</div>
			{/* 全屏對比對話框 */}
			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-6xl max-h-[90vh]">
					<DialogHeader className="flex flex-row items-center justify-between">
						<div className="flex items-center gap-2">
							<DialogTitle>文本對比</DialogTitle>
							<div className="flex items-center gap-1 ml-4">
								<Button
									variant="outline"
									size="icon"
									className="h-7 w-7"
									onClick={handleDialogPrevRun}
									disabled={dialogRunIndex === 0}
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								<span className="text-sm font-medium">
									Run {dialogRunIndex + 1}/{selectedModelGroup?.results.length || 0}
								</span>
								<Button
									variant="outline"
									size="icon"
									className="h-7 w-7"
									onClick={handleDialogNextRun}
									disabled={!selectedModelGroup || dialogRunIndex === selectedModelGroup.results.length - 1}
								>
									<ChevronRight className="h-4 w-4" />
								</Button>
							</div>
							{selectedModelGroup && selectedModelGroup.results.length > 1 && (
								<Select
									value={dialogRunIndex.toString()}
									onValueChange={(value) => setDialogRunIndex(Number.parseInt(value))}
								>
									<SelectTrigger className="w-[120px] h-8 text-xs">
										<SelectValue placeholder="選擇 Run" />
									</SelectTrigger>
									<SelectContent>
										{selectedModelGroup.results.map((_, index) => (
											<SelectItem key={index} value={index.toString()} className="text-xs">
												Run {index + 1}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Button
								variant={isMarkdownMode ? "outline" : "default"}
								size="sm"
								onClick={() => setIsMarkdownMode(false)}
							>
								<FileText className="h-4 w-4 mr-1" />
								純文本
							</Button>
							<Button
								variant={isMarkdownMode ? "default" : "outline"}
								size="sm"
								onClick={() => setIsMarkdownMode(true)}
							>
								<FileCode className="h-4 w-4 mr-1" />
								Markdown
							</Button>
							<Button
								variant={showRawText ? "default" : "outline"}
								size="sm"
								onClick={() => setShowRawText(!showRawText)}
							>
								<Code className="h-4 w-4 mr-1" />
								{showRawText ? "顯示原始文本" : "顯示清理後文本"}
							</Button>
						</div>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4 overflow-hidden h-full">
						<div className="space-y-2 overflow-hidden">
							<h5 className="text-sm font-medium">模型輸出</h5>
							<div className="p-3 bg-muted rounded-md text-sm overflow-y-auto h-[calc(90vh-150px)]">
								{isMarkdownMode ? (
									<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
										{fixKatex(dialogResult?.extractedText || "")}
									</ReactMarkdown>
								) : (
									<pre className="whitespace-pre-wrap">
										{showRawText && ignoreLatexCommands
											? cleanLatexForComparison(dialogResult?.extractedText || "")
											: dialogResult?.extractedText}
									</pre>
								)}
							</div>
						</div>
						<div className="space-y-2 overflow-hidden">
							<h5 className="text-sm font-medium">預期結果</h5>
							<div className="p-3 bg-muted rounded-md text-sm overflow-y-auto h-[calc(90vh-150px)]">
								{isMarkdownMode ? (
									<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
										{fixKatex(groundTruth || "")}
									</ReactMarkdown>
								) : (
									<pre className="whitespace-pre-wrap">
										{showRawText && ignoreLatexCommands ? cleanLatexForComparison(groundTruth || "") : groundTruth}
									</pre>
								)}
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</TooltipProvider>
	)
}
