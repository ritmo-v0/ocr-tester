"use client"
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";

// Components & UI
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
import { Play, Loader2 } from "lucide-react"
import type { TestVersion, ModelConfig } from "@/types/ocr-types"
import { calculateAccuracy } from "@/components/text-diff"

interface PromptEditorProps {
	imageUrl: string
	groundTruth: string
	modelConfigs: ModelConfig[]
	onVersionCreated: (version: TestVersion) => void
	activeVersion: TestVersion | null
	temperature?: number
	batchSize?: number
	versionKey?: (systemPrompt: string, userPrompt: string) => TestVersion | undefined
}

const DEFAULT_USER_PROMPT = "Extract all text from this image accurately. Return only the extracted text without any additional commentary.";



export function PromptEditor({
	imageUrl,
	groundTruth,
	modelConfigs,
	onVersionCreated,
	activeVersion,
	temperature = 0.0,
	batchSize = 1,
	versionKey,
}: PromptEditorProps) {
	const [systemPrompt, setSystemPrompt] = useState(
		"You are an OCR assistant. Extract all text from the image accurately. Return only the extracted text without any additional commentary.",
	)
	const [userPrompt, setUserPrompt] = useState(
		DEFAULT_USER_PROMPT
	)
	const [isRunning, setIsRunning] = useState(false)
	const [error, setError] = useState<string | null>(null)
	// const { user } = useAuth() // Removed old Firebase auth

	// Removed getAuthToken function as it's no longer needed for cookie-based auth with backend

	// Update prompts when active version changes
	useEffect(() => {
		if (activeVersion) {
			setSystemPrompt(activeVersion.systemPrompt)
			setUserPrompt(activeVersion.userPrompt || DEFAULT_USER_PROMPT)
		}
	}, [activeVersion])

	const runTest = async () => {
		if (!imageUrl) {
			setError("Please provide an image URL")
			return
		}

		if (!groundTruth) {
			setError("Please provide ground truth text")
			return
		}

		if (modelConfigs.length === 0 || !modelConfigs.some((m) => m.enabled)) {
			setError("Please select at least one model")
			return
		}

		setIsRunning(true)
		setError(null)

		try {
			// No need to explicitly get auth token for cookie-based sessions
			// The browser will automatically send the session cookie

			// 檢查是否已有相同 prompt 的版本
			let existingVersion = null
			if (versionKey) {
				existingVersion = versionKey(systemPrompt, userPrompt)
			} else {
				// 如果沒有提供 versionKey 函數，則在所有版本中查找
				const allVersions = activeVersion ? [activeVersion] : [] // This logic might need review if activeVersion is the only source
				existingVersion = allVersions.find((v) => v.systemPrompt === systemPrompt && v.userPrompt === userPrompt)
			}

			const response = await fetch("/api/ocr", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// Authorization header removed, cookie will handle auth
				},
				body: JSON.stringify({
					imageUrl,
					systemPrompt,
					userPrompt,
					models: modelConfigs.filter((m) => m.enabled).map((m) => m.model),
					temperature,
					batchSize,
				}),
			})

			console.log("API Response status:", response.status)

			if (!response.ok) {
				const errorText = await response.text()
				console.error("API Error:", errorText)
				try {
					const errorData = JSON.parse(errorText)
					// If the API returns a 401 or 403 due to missing/invalid session,
					// we might want to redirect to login or show a specific message.
					if (response.status === 401 || response.status === 403) {
						throw new Error(errorData.error || "Authentication required. Please log in.")
					}
					throw new Error(errorData.error || "An unknown error occurred")
				} catch (e) {
					if (
						e instanceof Error &&
						(e.message.includes("Authentication required") || e.message.includes("Unauthorized"))
					) {
						throw e
					}
					throw new Error(`API error: ${response.status} ${response.statusText}`)
				}
			}

			const data = await response.json()
			console.log("API Response data:", data)

			// Process results
			const results = data.results.map((result: { provider: string; model: string; text: string; raw: any }) => ({
				id: nanoid(7),
				provider: result.provider,
				model: result.model,
				fullModelName: `${result.provider}-${result.model}`, // 添加完整模型名稱
				extractedText: result.text,
				accuracy: calculateAccuracy(groundTruth, result.text, true),
				apiResponse: result.raw,
			}))

			if (existingVersion) {
				// 更新現有版本，添加新結果
				const updatedVersion: TestVersion = {
					...existingVersion,
					results: [...existingVersion.results, ...results],
					timestamp: new Date().toISOString(), // 更新時間戳
					temperature, // 更新溫度
				}

				onVersionCreated(updatedVersion)

				toast("測試完成", { description: `已更新版本，添加了 ${results.length} 個新模型結果。` });
			} else {
				// Create a new version
				const newVersion: TestVersion = {
					id: nanoid(7),
					timestamp: new Date().toISOString(),
					systemPrompt,
					userPrompt,
					temperature,
					model: "", // 這個字段將在 OcrTestingInterface 中被忽略
					maxTokens: 1000, // 默認值
					results,
					versionNumber: 0, // 這個值將在 OcrTestingInterface 中被覆蓋
				}

				onVersionCreated(newVersion)

				toast("Test Completed", { description: `Created version with ${results.length} model results.` });
			}
		} catch (error) {
			console.error("Error running OCR test:", error)
			const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
			setError(errorMessage)

			toast.error("Error", { description: errorMessage });
		} finally {
			setIsRunning(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="system-prompt">System Prompt</Label>
				<Textarea
					id="system-prompt"
					value={systemPrompt}
					onChange={(e) => setSystemPrompt(e.target.value)}
					placeholder="You are an OCR assistant. Extract all text from the image accurately."
					rows={5}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="user-prompt">User Prompt</Label>
				<Textarea
					id="user-prompt"
					value={userPrompt}
					onChange={(e) => setUserPrompt(e.target.value)}
					placeholder="Extract all text from this image accurately."
					rows={3}
				/>
			</div>

			<div className="space-y-2">
				<Label>Selected Models</Label>
				<div className="flex flex-wrap gap-2">
					{modelConfigs
						.filter((m) => m.enabled)
						.map((config) => (
							<Badge key={`${config.provider}-${config.model}`} variant="outline">
								{config.provider}: {config.model}
							</Badge>
						))}
				</div>
			</div>

			{error && (
				<div className="p-3 bg-destructive/10 border border-destructive rounded-md text-destructive text-sm">
					<strong>Error:</strong> {error}
				</div>
			)}

			<div className="sticky bottom-4 pt-4 bg-background pb-4">
				{" "}
				{/* Added bg-background and pb-4 for better sticky behavior */}
				<Button onClick={runTest} disabled={isRunning || !imageUrl || !groundTruth} className="w-full">
					{isRunning ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Running...
						</>
					) : (
						<>
							<Play className="mr-2 h-4 w-4" />
							Run Test {batchSize > 1 ? `(${batchSize}x)` : ""}
						</>
					)}
				</Button>
			</div>
		</div>
	)
}
