"use client"
import { useCallback, useState } from "react";

// Components & UI
import { AccuracyChart } from "@/components/accuracy-chart";
import { Leaderboard } from "@/components/leaderboard";
import { ModelSelector } from "@/components/model-selector";
import { PromptEditor } from "@/components/prompt-editor";
import { VersionResults } from "@/components/version-results";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestDataImporter } from "@/components/test-data-importer";

// Types & Interfaces
import type { ModelConfig, OcrTestingState, TestVersion } from "@/types/ocr-types";
import { Muted, P } from "./common/typography";
interface OcrTestingInterfaceProps {
	initialState?: Partial<OcrTestingState>
	onStateChange?: (state: OcrTestingState) => void
};



export function OcrTestingInterface({ initialState, onStateChange }: OcrTestingInterfaceProps) {
	const [state, setState] = useState<OcrTestingState>(() => ({
		imageUrl: initialState?.imageUrl || "",
		groundTruth: initialState?.groundTruth || "",
		versions: initialState?.versions || [],
		modelConfigs: initialState?.modelConfigs || [
			{ provider: "openai", model: "gpt-4o", enabled: true },
			{ provider: "openai", model: "gpt-4o-mini", enabled: false },
			{ provider: "gemini", model: "gemini-2.0-flash", enabled: true },
			{ provider: "gemini", model: "gemini-2.0-flash-lite", enabled: false },
			{ provider: "gemini", model: "gemini-2.0-pro-exp-02-05", enabled: false },
		],
		activeVersionId: initialState?.activeVersionId || null,
		testCases: initialState?.testCases || [],
		nextVersionNumber: initialState?.nextVersionNumber || 1,
	}))

	// 使用 useCallback 包裝狀態更新函數，避免不必要的重新創建
	const updateImageAndGroundTruth = useCallback(
		(imageUrl: string, groundTruth: string) => {
			setState((prev) => {
				const newState = { ...prev, imageUrl, groundTruth }
				if (onStateChange) onStateChange(newState)
				return newState
			})
		},
		[onStateChange],
	)

	const updateModelConfigs = useCallback(
		(modelConfigs: ModelConfig[]) => {
			setState((prev) => {
				const newState = { ...prev, modelConfigs }
				if (onStateChange) onStateChange(newState)
				return newState
			})
		},
		[onStateChange],
	)

	const addVersion = useCallback(
		(version: TestVersion) => {
			setState((prev) => {
				// 檢查是否已存在相同 ID 的版本
				const existingIndex = prev.versions.findIndex((v) => v.id === version.id)
				let newState

				if (existingIndex >= 0) {
					// 更新現有版本，保留其版本號
					const updatedVersions = [...prev.versions]
					updatedVersions[existingIndex] = {
						...version,
						versionNumber: updatedVersions[existingIndex].versionNumber, // 保留原版本號
					}

					newState = {
						...prev,
						versions: updatedVersions,
						activeVersionId: version.id,
					}
				} else {
					// 添加新版本，分配新的版本號
					const newVersion = {
						...version,
						versionNumber: prev.nextVersionNumber,
					}

					newState = {
						...prev,
						versions: [...prev.versions, newVersion],
						activeVersionId: version.id,
						nextVersionNumber: prev.nextVersionNumber + 1, // 增加下一個版本號
					}
				}

				if (onStateChange) onStateChange(newState)
				return newState
			})
		},
		[onStateChange],
	)

	const setActiveVersion = useCallback(
		(versionId: string) => {
			setState((prev) => {
				const newState = { ...prev, activeVersionId: versionId }
				if (onStateChange) onStateChange(newState)
				return newState
			})
		},
		[onStateChange],
	)

	const getActiveVersion = () => {
		if (!state.activeVersionId) return null
		return state.versions.find((v) => v.id === state.activeVersionId) || null
	}

	const activeVersion = getActiveVersion()

	return (
		<div>
			<header className="flex items-center justify-between mb-6">
				<h1 className="text-3xl font-bold">OCR 測試界面</h1>
				<div className="flex items-center gap-4">
					<div className="flex gap-2">
						<TestDataImporter
							onImport={updateImageAndGroundTruth}
							currentImageUrl={state.imageUrl}
							currentGroundTruth={state.groundTruth}
						/>
						<ModelSelector modelConfigs={state.modelConfigs} onChange={updateModelConfigs} />
					</div>
				</div>
			</header>

			<ResizablePanelGroup direction="horizontal" className="min-h-[600px]">
				{/* Column 1: Prompt Editor */}
				<ResizablePanel defaultSize={33} minSize={25}>
					<div className="flex flex-col gap-6">
						<PromptEditorResizablePanelCardContent
							state={state}
							activeVersion={activeVersion}
							addVersion={addVersion}
						/>
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				{/* Column 2: Version History */}
				<ResizablePanel defaultSize={33} minSize={25}>
					<div className="flex flex-col gap-6">
						<CardContent className="p-4">
							<div className="!min-w-auto h-[calc(100vh-200px)] overflow-y-auto">
								<div className="space-y-4">
									<h2 className="text-xl font-bold">Version History</h2>
									{state.versions.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground">
											No versions yet. Create a new version by running a test.
										</div>
									) : (
										<div className="space-y-4">
											{[...state.versions]
												.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
												.map((version) => (
													<Button
														key={version.id}
														variant={version.id === state.activeVersionId ? "default" : "outline"}
														className="w-full justify-start text-left h-auto py-3"
														onClick={() => setActiveVersion(version.id)}
													>
														<div className="grid text-start">
															<span className="font-medium">Version {version.versionNumber}</span>
															<Muted className="text-xs truncate">{new Date(version.timestamp).toLocaleString()}</Muted>
															<P className="!mt-1 text-xs max-w-full truncate">
																{version.systemPrompt}...
															</P>
														</div>
													</Button>
												))}
										</div>
									)}
								</div>
							</div>
						</CardContent>
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				{/* Column 3: Results */}
				<ResizablePanel defaultSize={33} minSize={25}>
					<div className="flex flex-col gap-6">
						<CardContent className="p-4 pr-0">
							{activeVersion ? (
								<VersionResults version={activeVersion} groundTruth={state.groundTruth} />
							) : (
								<div className="text-center py-12 text-muted-foreground">Select a version to view results.</div>
							)}
						</CardContent>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>

			{/* Analytics Section */}
			{state.versions.length > 0 && (
				<div className="mt-8 space-y-6">
					<h2 className="text-2xl font-bold">Analytics</h2>

					<Tabs defaultValue="leaderboard">
						<TabsList>
							<TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
							<TabsTrigger value="trends">Accuracy Trends</TabsTrigger>
						</TabsList>

						<TabsContent value="leaderboard" className="pt-4">
							<Leaderboard versions={state.versions} />
						</TabsContent>

						<TabsContent value="trends" className="pt-4">
							<AccuracyChart versions={state.versions} />
						</TabsContent>
					</Tabs>
				</div>
			)}
		</div>
	)
}

function PromptEditorResizablePanelCardContent(
	{ state, activeVersion, addVersion }: { state: OcrTestingState, activeVersion: TestVersion | null, addVersion: (version: TestVersion) => void }
) {
	const [temperature, setTemperature] = useState(0.0);
	const [batchSize, setBatchSize] = useState(1);

	return (
		<CardContent className="p-4 pl-0">
			<div className="space-y-6">
				<TemperatureSlider
					temperature={temperature}
					setTemperature={setTemperature}
				/>

				<div className="space-y-2">
					<Label htmlFor="batch-size">Batch Size</Label>
					<Select value={batchSize.toString()} onValueChange={(value) => setBatchSize(Number(value))}>
						<SelectTrigger id="batch-size">
							<SelectValue placeholder="Select batch size" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1">Run Once</SelectItem>
							<SelectItem value="5">Run 5 Times</SelectItem>
							<SelectItem value="10">Run 10 Times</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<PromptEditor
					imageUrl={state.imageUrl}
					groundTruth={state.groundTruth}
					modelConfigs={state.modelConfigs.filter((m) => m.enabled)}
					onVersionCreated={addVersion}
					activeVersion={activeVersion}
					temperature={temperature}
					batchSize={batchSize}
					versionKey={(systemPrompt, userPrompt) => {
						// 在所有版本中查找匹配的 prompt
						return state.versions.find((v) => v.systemPrompt === systemPrompt && v.userPrompt === userPrompt)
					}}
				/>
			</div>
		</CardContent>
	);
}

function TemperatureSlider({ temperature, setTemperature }: { temperature: number; setTemperature: (value: number) => void }) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<Label htmlFor="temperature">Temperature: {temperature.toFixed(2)}</Label>
			</div>
			<Slider
				id="temperature"
				min={0}
				max={1}
				step={0.01}
				value={[temperature]}
				onValueChange={(value) => setTemperature(value[0])}
			/>
		</div>
	);
}