"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImagePreview } from "./image-preview"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Image } from "lucide-react"

interface TestImageDialogProps {
  imageUrl: string
  groundTruth: string
  onUpdate: (imageUrl: string, groundTruth: string) => void
}

export function TestImageDialog({ imageUrl, groundTruth, onUpdate }: TestImageDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [localImageUrl, setLocalImageUrl] = useState(imageUrl)
  const [localGroundTruth, setLocalGroundTruth] = useState(groundTruth)
  const { toast } = useToast()

  // Reset local state when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalImageUrl(imageUrl)
      setLocalGroundTruth(groundTruth)
    }
    setIsOpen(open)
  }

  const handleSave = () => {
    onUpdate(localImageUrl, localGroundTruth)
    setIsOpen(false)
    toast({
      title: "Test image updated",
      description: "The test image and ground truth have been updated.",
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      // Convert file to base64
      const base64 = await fileToBase64(file)
      setLocalImageUrl(base64)

      toast({
        title: "Image uploaded",
        description: "Image converted to base64 and ready to use.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const downloadTestCase = () => {
    const data = {
      imageUrl: localImageUrl,
      groundTruth: localGroundTruth,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ocr-test-case-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Test case exported",
      description: "The test case has been exported as a JSON file.",
    })
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        setLocalImageUrl(data.imageUrl)
        setLocalGroundTruth(data.groundTruth)

        toast({
          title: "Test case imported",
          description: "The test case has been imported successfully.",
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse the imported file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => handleOpenChange(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <Image className="h-4 w-4 mr-2" />
          Test Image
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Test Image & Ground Truth</DialogTitle>
          <DialogDescription>
            Upload a test image or enter an image URL, and set the expected OCR text output.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="image-url">Image URL or Base64</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <label>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Converting..." : "Upload Image"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                  </label>
                </Button>
              </div>
            </div>

            <Input
              id="image-url"
              placeholder="Enter image URL or paste base64 data"
              value={localImageUrl}
              onChange={(e) => setLocalImageUrl(e.target.value)}
            />

            {localImageUrl && <ImagePreview url={localImageUrl} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ground-truth">Ground Truth Text</Label>
            <Textarea
              id="ground-truth"
              placeholder="Enter the expected OCR text output..."
              value={localGroundTruth}
              onChange={(e) => setLocalGroundTruth(e.target.value)}
              rows={6}
            />
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTestCase} disabled={!localImageUrl}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" asChild>
                <label>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                  <input type="file" className="hidden" accept="application/json" onChange={handleFileImport} />
                </label>
              </Button>
            </div>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
