"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUp, Loader2 } from "lucide-react"
import Papa from "papaparse"

interface CsvImporterProps {
	onImport: (selectedRows: Array<{ imageUrl: string; text: string }>) => void
}

export function CsvImporter({ onImport }: CsvImporterProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [csvUrl, setCsvUrl] = useState<string>("")
	const [isLoading, setIsLoading] = useState(false)
	const [csvData, setCsvData] = useState<any[]>([])
	const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({})

	// Default URL from the user's request
	useEffect(() => {
		setCsvUrl(
			"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%88%91%E7%9A%84%E6%89%B9%E6%94%B9%E8%B3%87%E6%96%99%E9%9B%86-v-2025-03-10T16-53-31-IFbLCYCkgvLckaUzVlbYt2kItGQ5O2.csv",
		)
	}, [])

	const fetchCsv = async () => {
		if (!csvUrl) {
			toast.error("Error", { description: "Please enter a CSV URL" })
			return
		}

		setIsLoading(true)
		try {
			const response = await fetch(csvUrl)
			if (!response.ok) {
				throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`)
			}

			const csvText = await response.text()

			Papa.parse(csvText, {
				header: true,
				complete: (results) => {
					console.log("Parsed CSV:", results)
					setCsvData(results.data)
					// Reset selections
					setSelectedRows({})
				},
				error: (error) => {
					console.error("CSV parsing error:", error)
					toast.error("Error parsing CSV", { description: error.message })
				},
			})
		} catch (error) {
			console.error("Error fetching CSV:", error)
			toast.error("Error fetching CSV", { description: error instanceof Error ? error.message : "Unknown error" })
		} finally {
			setIsLoading(false)
		}
	}

	// 確保 toggleRow 函數參數有明確的類型
	const toggleRow = (index: number) => {
		setSelectedRows((prev) => ({
			...prev,
			[index]: !prev[index],
		}))
	}

	const toggleAllRows = () => {
		if (Object.keys(selectedRows).length === csvData.length) {
			// If all are selected, deselect all
			setSelectedRows({})
		} else {
			// Otherwise, select all
			const newSelected: Record<number, boolean> = {}
			csvData.forEach((_, index) => {
				newSelected[index] = true
			})
			setSelectedRows(newSelected)
		}
	}

	// 確保 handleImport 函數中的 map 和 filter 回調參數有明確的類型
	const handleImport = () => {
		const selectedData = Object.entries(selectedRows)
			.filter(([_, isSelected]) => isSelected)
			.map(([index]) => {
				const row = csvData[Number(index)]
				return {
					imageUrl: row.imageUrl || row.image_url || row.url || "",
					text: row.text || row.groundTruth || row.ground_truth || row.expected || "",
				}
			})
			.filter((item) => item.imageUrl && item.text)

		if (selectedData.length === 0) {
			toast("No rows selected", { description: "Please select at least one row with both image URL and text" })
			return
		}

		onImport(selectedData)
		setIsOpen(false)
		toast("Import successful", { description: `Imported ${selectedData.length} test cases` })
	}

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
					<FileUp className="h-4 w-4 mr-2" />
					Import CSV
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>Import Test Cases from CSV</DialogTitle>
					<DialogDescription>Import test cases from a CSV file with imageUrl and text columns</DialogDescription>
				</DialogHeader>

				<div className="flex items-end gap-2 my-4">
					<div className="flex-1">
						<Label htmlFor="csv-url">CSV URL</Label>
						<Input
							id="csv-url"
							value={csvUrl}
							onChange={(e) => setCsvUrl(e.target.value)}
							placeholder="https://example.com/data.csv"
						/>
					</div>
					<Button onClick={fetchCsv} disabled={isLoading}>
						{isLoading ? (
							<>
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								Loading...
							</>
						) : (
							"Load CSV"
						)}
					</Button>
				</div>

				<div className="flex-1 overflow-auto">
					{csvData.length > 0 ? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Checkbox
											checked={Object.keys(selectedRows).length === csvData.length}
											onCheckedChange={toggleAllRows}
										/>
									</TableHead>
									<TableHead>Image URL</TableHead>
									<TableHead>Text</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{csvData.map((row, index) => {
									const imageUrl = row.imageUrl || row.image_url || row.url || ""
									const text = row.text || row.groundTruth || row.ground_truth || row.expected || ""

									return (
										<TableRow key={index}>
											<TableCell>
												<Checkbox checked={!!selectedRows[index]} onCheckedChange={() => toggleRow(index)} />
											</TableCell>
											<TableCell className="max-w-[300px] truncate">{imageUrl}</TableCell>
											<TableCell className="max-w-[300px] truncate">{text}</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
					) : (
						<div className="text-center py-8 text-muted-foreground">
							{isLoading ? "Loading CSV data..." : "No CSV data loaded. Click 'Load CSV' to fetch data."}
						</div>
					)}
				</div>

				<div className="flex justify-between mt-4">
					<div className="text-sm text-muted-foreground">
						{Object.values(selectedRows).filter(Boolean).length} of {csvData.length} rows selected
					</div>
					<Button onClick={handleImport} disabled={Object.values(selectedRows).filter(Boolean).length === 0}>
						Import Selected
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
