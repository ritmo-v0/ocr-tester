"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { TextDiff } from "@/components/text-diff"
import type { TestVersion } from "@/types/ocr-types"

interface VersionComparisonProps {
	versions: TestVersion[]
}

export function VersionComparison({ versions }: VersionComparisonProps) {
	const [selectedVersions, setSelectedVersions] = useState<{
		version1: string | null
		version2: string | null
	}>({
		version1: versions.length > 0 ? versions[versions.length - 1].id : null,
		version2: versions.length > 1 ? versions[versions.length - 2].id : null,
	})

	const getVersion = (versionId: string | null) => {
		if (!versionId) return null
		return versions.find((v) => v.id === versionId) || null
	}

	const getAverageAccuracy = (version: TestVersion) => {
		if (!version.results || version.results.length === 0) return 0
		const sum = version.results.reduce((acc: number, result) => acc + result.accuracy, 0)
		return sum / version.results.length
	}

	const version1 = getVersion(selectedVersions.version1)
	const version2 = getVersion(selectedVersions.version2)

	const getProviderBadge = (provider: string | undefined) => {
		if (!provider) {
			return <Badge variant="outline">Unknown</Badge>
		}

		switch (provider) {
			case "openai":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
						OpenAI
					</Badge>
				)
			case "gemini":
				return (
					<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
						Gemini
					</Badge>
				)
			case "anthropic":
				return (
					<Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
						Anthropic
					</Badge>
				)
			default:
				return <Badge variant="outline">{provider}</Badge>
		}
	}

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 gap-2">
				<div className="space-y-2">
					<Label className="text-xs">Version 1</Label>
					<Select
						value={selectedVersions.version1 || undefined}
						onValueChange={(value) => setSelectedVersions({ ...selectedVersions, version1: value })}
					>
						<SelectTrigger className="text-xs h-8">
							<SelectValue placeholder="Select version" />
						</SelectTrigger>
						<SelectContent>
							{versions.map((version, index) => (
								<SelectItem key={version.id} value={version.id} className="text-xs">
									V{versions.length - index} ({new Date(version.timestamp).toLocaleString()})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="space-y-2">
					<Label className="text-xs">Version 2</Label>
					<Select
						value={selectedVersions.version2 || undefined}
						onValueChange={(value) => setSelectedVersions({ ...selectedVersions, version2: value })}
					>
						<SelectTrigger className="text-xs h-8">
							<SelectValue placeholder="Select version" />
						</SelectTrigger>
						<SelectContent>
							{versions.map((version, index) => (
								<SelectItem key={version.id} value={version.id} className="text-xs">
									V{versions.length - index} ({new Date(version.timestamp).toLocaleString()})
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{version1 && version2 ? (
				<>
					<div className="space-y-2">
						<h3 className="text-sm font-medium">Text Difference</h3>
						<TextDiff original={version2.results[0].extractedText} modified={version1.results[0].extractedText} />
					</div>

					<div className="grid grid-cols-2 gap-4 mt-4">
						<div className="space-y-2 border rounded-md p-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Version 1</h3>
								<Badge
									variant={
										getAverageAccuracy(version1) > 0.9
											? "success"
											: getAverageAccuracy(version1) > 0.7
												? "warning"
												: "destructive"
									}
								>
									{(getAverageAccuracy(version1) * 100).toFixed(1)}%
								</Badge>
							</div>
							<div className="text-xs space-y-1 mt-2">
								<div className="flex items-center gap-1 flex-wrap">
									{version1.provider ? getProviderBadge(version1.provider) : <Badge variant="outline">Unknown</Badge>}
									<Badge variant="outline">
										{version1.provider}: {version1.model}
									</Badge>
									<Badge variant="outline">Temp: {version1.temperature.toFixed(2)}</Badge>
								</div>
								<Separator className="my-2" />
								<div className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md max-h-[150px] overflow-y-auto">
									{version1.results[0].extractedText}
								</div>
							</div>
						</div>

						<div className="space-y-2 border rounded-md p-3">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-medium">Version 2</h3>
								<Badge
									variant={
										getAverageAccuracy(version2) > 0.9
											? "success"
											: getAverageAccuracy(version2) > 0.7
												? "warning"
												: "destructive"
									}
								>
									{(getAverageAccuracy(version2) * 100).toFixed(1)}%
								</Badge>
							</div>
							<div className="text-xs space-y-1 mt-2">
								<div className="flex items-center gap-1 flex-wrap">
									{version2.provider ? getProviderBadge(version2.provider) : <Badge variant="outline">Unknown</Badge>}
									<Badge variant="outline">
										{version2.provider}: {version2.model}
									</Badge>
									<Badge variant="outline">Temp: {version2.temperature.toFixed(2)}</Badge>
								</div>
								<Separator className="my-2" />
								<div className="text-xs whitespace-pre-wrap bg-muted p-2 rounded-md max-h-[150px] overflow-y-auto">
									{version2.results[0].extractedText}
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2 mt-4">
						<h3 className="text-sm font-medium">Parameter Differences</h3>
						<div className="text-xs p-3 bg-muted rounded-md">
							{version1.provider !== version2.provider && (
								<div className="grid grid-cols-2 gap-1">
									<div>Provider:</div>
									<div>
										{version1.provider || "Unknown"} → {version2.provider || "Unknown"}
									</div>
								</div>
							)}
							{version1.model !== version2.model && (
								<div className="grid grid-cols-2 gap-1">
									<div>Model:</div>
									<div>
										{version1.model} → {version2.model}
									</div>
								</div>
							)}
							{version1.temperature !== version2.temperature && (
								<div className="grid grid-cols-2 gap-1">
									<div>Temperature:</div>
									<div>
										{version1.temperature.toFixed(2)} → {version2.temperature.toFixed(2)}
									</div>
								</div>
							)}
							{version1.maxTokens !== version2.maxTokens && (
								<div className="grid grid-cols-2 gap-1">
									<div>Max Tokens:</div>
									<div>
										{version1.maxTokens} → {version2.maxTokens}
									</div>
								</div>
							)}
							{version1.systemPrompt !== version2.systemPrompt && (
								<div className="grid grid-cols-2 gap-1">
									<div>System Prompt:</div>
									<div>Changed</div>
								</div>
							)}
							{version1.provider === version2.provider &&
								version1.model === version2.model &&
								version1.temperature === version2.temperature &&
								version1.maxTokens === version2.maxTokens &&
								version1.systemPrompt === version2.systemPrompt && <div>No parameter differences</div>}
						</div>
					</div>
				</>
			) : (
				<div className="text-center py-8 text-muted-foreground">Select two versions to compare</div>
			)}
		</div>
	)
}
