"use client"
import { useState } from "react";

// Components & UI
import { ImagePreview } from "@/components/image-preview";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Icons & Images
import { FileUp } from "lucide-react";

interface TestDataImporterProps {
	onImport: (imageUrl: string, groundTruth: string) => void
	currentImageUrl: string
	currentGroundTruth: string
}



export function TestDataImporter({ onImport, currentImageUrl, currentGroundTruth }: TestDataImporterProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [localGroundTruth, setLocalGroundTruth] = useState(currentGroundTruth)

	// Reset local state when dialog opens
	const handleOpenChange = (open: boolean) => {
		if (open) {
			setLocalGroundTruth(currentGroundTruth)
		}
		setIsOpen(open)
	}

	const handleSave = () => {
		onImport(currentImageUrl, localGroundTruth)
		setIsOpen(false)
		toast("測試數據已更新", { description: "預期文本已更新。" });
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
					<FileUp className="h-4 w-4 mr-2" />
					編輯預期文本
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>測試數據 & 預期結果</DialogTitle>
					<DialogDescription>查看測試圖片並編輯預期的 OCR 文本輸出。</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4 max-h-[60svh] overflow-y-auto">
					{currentImageUrl && (
						<div className="mt-4">
							<Label className="mb-2 block">圖片預覽</Label>
							<ImagePreview url={currentImageUrl} />
						</div>
					)}

					<div className="space-y-2">
						<Label htmlFor="ground-truth">預期 OCR 文本</Label>
						<Textarea
							id="ground-truth"
							placeholder="輸入預期的 OCR 文本輸出..."
							value={localGroundTruth}
							onChange={(e) => setLocalGroundTruth(e.target.value)}
							rows={6}
						/>
					</div>
				</div>

				<DialogFooter className="flex justify-end gap-2 pt-4">
					<Button onClick={handleSave}>保存更改</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
