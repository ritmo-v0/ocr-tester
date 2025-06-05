"use client"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Settings } from "lucide-react"
import type { ModelConfig } from "@/types/ocr-types"

interface ModelSelectorProps {
  modelConfigs: ModelConfig[]
  onChange: (modelConfigs: ModelConfig[]) => void
}

export function ModelSelector({ modelConfigs, onChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localConfigs, setLocalConfigs] = useState<ModelConfig[]>(modelConfigs)

  const handleToggle = (provider: string, model: string) => {
    const newConfigs = localConfigs.map((config) => {
      if (config.provider === provider && config.model === model) {
        return { ...config, enabled: !config.enabled }
      }
      return config
    })

    setLocalConfigs(newConfigs)
  }

  const handleSave = () => {
    onChange(localConfigs)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setLocalConfigs(modelConfigs)
    setIsOpen(false)
  }

  const getEnabledCount = () => {
    return localConfigs.filter((c) => c.enabled).length
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Models ({getEnabledCount()})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Models</DialogTitle>
          <DialogDescription>Choose which models to use for OCR testing.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">OpenAI Models</h3>
            <div className="space-y-2">
              {localConfigs
                .filter((config) => config.provider === "openai")
                .map((config) => (
                  <div key={config.model} className="flex items-center space-x-2">
                    <Checkbox
                      id={`openai-${config.model}`}
                      checked={config.enabled}
                      onCheckedChange={() => handleToggle("openai", config.model)}
                    />
                    <Label htmlFor={`openai-${config.model}`}>{config.model}</Label>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Gemini Models</h3>
            <div className="space-y-2">
              {localConfigs
                .filter((config) => config.provider === "gemini")
                .map((config) => (
                  <div key={config.model} className="flex items-center space-x-2">
                    <Checkbox
                      id={`gemini-${config.model}`}
                      checked={config.enabled}
                      onCheckedChange={() => handleToggle("gemini", config.model)}
                    />
                    <Label htmlFor={`gemini-${config.model}`}>{config.model}</Label>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
