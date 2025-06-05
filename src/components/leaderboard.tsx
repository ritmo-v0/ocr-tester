"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { useState } from "react"
import type { TestVersion } from "@/types/ocr-types"

interface LeaderboardProps {
  versions: TestVersion[]
}

interface LeaderboardEntry {
  versionId: string
  versionNumber: number
  provider: string
  model: string
  systemPrompt: string
  userPrompt: string
  accuracy: number
  timestamp: string
}

export function Leaderboard({ versions }: LeaderboardProps) {
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // 修改 Leaderboard 組件，確保顯示完整的模型名稱
  const entries: LeaderboardEntry[] = versions.flatMap((version) => {
    return version.results
      .filter((result) => result.provider && result.model) // 過濾掉沒有 provider 或 model 的結果
      .map((result) => ({
        versionId: version.id,
        versionNumber: version.versionNumber,
        provider: result.provider || "unknown", // 提供默認值
        model: result.model || "unknown", // 提供默認值
        fullModelName: `${result.provider || "unknown"}-${result.model || "unknown"}`, // 添加完整模型名稱
        systemPrompt: version.systemPrompt,
        userPrompt: version.userPrompt || "Extract all text from this image accurately.",
        accuracy: result.accuracy * 100,
        timestamp: version.timestamp,
      }))
  })

  // Sort by accuracy descending
  entries.sort((a, b) => b.accuracy - a.accuracy)

  const handleInfoClick = (entry: LeaderboardEntry) => {
    setSelectedEntry(entry)
    setDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead className="w-[80px]">Version</TableHead>
                <TableHead className="w-[120px]">Provider</TableHead>
                <TableHead className="w-[100px]">Accuracy</TableHead>
                <TableHead>Prompts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <TableRow key={`${entry.versionId}-${entry.provider}-${entry.model}-${index}`}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>V{entry.versionNumber}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        entry.provider === "openai"
                          ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                      }
                    >
                      {entry.provider}: {entry.model}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.accuracy > 90 ? "success" : entry.accuracy > 70 ? "warning" : "destructive"}>
                      {entry.accuracy.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="max-w-[300px] truncate">
                        <span className="font-medium">System:</span> {entry.systemPrompt.substring(0, 50)}
                        {entry.systemPrompt.length > 50 ? "..." : ""}
                      </div>
                      <Button variant="ghost" size="icon" className="ml-2" onClick={() => handleInfoClick(entry)}>
                        <Info className="h-4 w-4" />
                        <span className="sr-only">View full prompts</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Version {selectedEntry?.versionNumber} Prompts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">System Prompt</h4>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{selectedEntry?.systemPrompt}</div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">User Prompt</h4>
              <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">{selectedEntry?.userPrompt}</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
