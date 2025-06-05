"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Papa from "papaparse"

interface CsvFileUploaderProps {
  onImport: (selectedRows: Array<{ imageUrl: string; text: string }>) => void
}

export function CsvFileUploader({ onImport }: CsvFileUploaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // 處理文件上傳
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)

    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const csvText = event.target?.result as string

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            console.log("Parsed CSV:", results)

            // 轉換數據格式
            const data = results.data
              .map((row: any) => ({
                imageUrl: row.imageUrl || row.image_url || row.url || "",
                text: row.text || row.groundTruth || row.ground_truth || row.expected || "",
              }))
              .filter((item: any) => item.imageUrl && item.text)

            if (data.length === 0) {
              toast({
                title: "無效的 CSV 文件",
                description: "CSV 文件中沒有找到有效的圖片 URL 和文本數據",
                variant: "destructive",
              })
            } else {
              onImport(data)
              setIsOpen(false)
              toast({
                title: "導入成功",
                description: `已導入 ${data.length} 個測試案例`,
              })
            }
          },
          error: (error) => {
            console.error("CSV parsing error:", error)
            toast({
              title: "解析 CSV 錯誤",
              description: error.message,
              variant: "destructive",
            })
          },
        })
      } catch (error) {
        console.error("Error processing CSV:", error)
        toast({
          title: "處理 CSV 錯誤",
          description: error instanceof Error ? error.message : "未知錯誤",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      toast({
        title: "讀取文件錯誤",
        description: "無法讀取上傳的文件",
        variant: "destructive",
      })
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  // 使用預設測試範例
  const useDefaultExample = () => {
    const exampleData = [
      {
        imageUrl: "https://utfs.io/f/f47c4279-98d3-4dfb-b11f-98e33fe9d00e-shkis0.png?t=1741622816623",
        text: "早已褪去色彩的厚質絲綢、隨手拉扯都將脫線",
      },
    ]

    onImport(exampleData)
    setIsOpen(false)
    toast({
      title: "已加載預設範例",
      description: "已導入預設測試範例",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <FileUp className="h-4 w-4 mr-2" />
          導入測試數據
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>導入測試數據</DialogTitle>
          <DialogDescription>上傳 CSV 文件或使用預設測試範例</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button asChild variant="outline" className="w-full">
            <label className="cursor-pointer">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  正在處理...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  上傳 CSV 文件
                </>
              )}
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
            </label>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或</span>
            </div>
          </div>

          <Button onClick={useDefaultExample} disabled={isLoading}>
            使用預設測試範例
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
