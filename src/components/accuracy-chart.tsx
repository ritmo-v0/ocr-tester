"use client"

import { useMemo } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TestVersion } from "@/types/ocr-types"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface AccuracyChartProps {
  versions: TestVersion[]
}

export function AccuracyChart({ versions }: AccuracyChartProps) {
  const chartData = useMemo(() => {
    const labels = versions.map((v, i) => `V${i + 1}`)

    const openaiData = versions.map((v) => {
      const openaiResults = v.results.filter((r) => r.provider === "openai")
      if (openaiResults.length === 0) return null
      const accuracies = openaiResults.map((r) => r.accuracy * 100)
      return {
        avg: accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length,
        min: Math.min(...accuracies),
        max: Math.max(...accuracies),
      }
    })

    const geminiData = versions.map((v) => {
      const geminiResults = v.results.filter((r) => r.provider === "gemini")
      if (geminiResults.length === 0) return null
      const accuracies = geminiResults.map((r) => r.accuracy * 100)
      return {
        avg: accuracies.reduce((a: number, b: number) => a + b, 0) / accuracies.length,
        min: Math.min(...accuracies),
        max: Math.max(...accuracies),
      }
    })

    return {
      labels,
      datasets: [
        {
          label: "OpenAI",
          data: openaiData.map((d) => d?.avg || null),
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "OpenAI Range",
          data: openaiData.map((d) => d?.min || null),
          borderColor: "rgba(75, 192, 192, 0.2)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          fill: 1,
          tension: 0.1,
        },
        {
          label: "OpenAI Range",
          data: openaiData.map((d) => d?.max || null),
          borderColor: "rgba(75, 192, 192, 0.2)",
          backgroundColor: "rgba(75, 192, 192, 0.1)",
          fill: 1,
          tension: 0.1,
        },
        {
          label: "Gemini",
          data: geminiData.map((d) => d?.avg || null),
          borderColor: "rgb(255, 99, 132)",
          tension: 0.1,
          fill: false,
        },
        {
          label: "Gemini Range",
          data: geminiData.map((d) => d?.min || null),
          borderColor: "rgba(255, 99, 132, 0.2)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          fill: 4,
          tension: 0.1,
        },
        {
          label: "Gemini Range",
          data: geminiData.map((d) => d?.max || null),
          borderColor: "rgba(255, 99, 132, 0.2)",
          backgroundColor: "rgba(255, 99, 132, 0.1)",
          fill: 4,
          tension: 0.1,
        },
      ],
    }
  }, [versions])

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          filter: (item) => {
            // Only show main lines in legend
            return !item.text.includes("Range")
          },
        },
      },
      title: {
        display: true,
        text: "Accuracy Over Time",
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "Accuracy (%)",
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accuracy Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Line options={options} data={chartData} />
      </CardContent>
    </Card>
  )
}
