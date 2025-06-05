"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ImagePreviewProps {
	url: string
}

export function ImagePreview({ url }: ImagePreviewProps) {
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const handleImageLoad = () => {
		setIsLoading(false)
		setError(null)
	}

	const handleImageError = () => {
		setIsLoading(false)
		setError("Failed to load image. Please check the URL.")
	}

	return (
		<Card className="overflow-hidden">
			{isLoading && <Skeleton className="w-full h-[200px]" />}

			{error && <div className="w-full h-[200px] flex items-center justify-center text-destructive">{error}</div>}

			<img
				src={url || "/placeholder.svg?height=200&width=400"}
				alt="OCR test image"
				className={`w-full object-contain max-h-[200px] ${isLoading ? "hidden" : ""}`}
				onLoad={handleImageLoad}
				onError={handleImageError}
			/>
		</Card>
	)
}
