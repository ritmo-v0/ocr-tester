"use client"
import { useCallback, useEffect, useState } from "react";
// import Papa from "papaparse";

// Components & UI
import { ImagePreview } from "@/components/image-preview";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Textarea } from "@/components/ui/textarea";
import { Muted } from "./common/typography"

// Icons & Images
// import { Upload } from "lucide-react";

// Types & Interfaces
import type { TestArea } from "@/types/test-area-types";

interface CreateTestDataDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (data: TestArea) => void;
}

// Constants & Variables
const DEFAULT_EXAMPLES = [
	{
		name: "中文直書作文",
		imageUrl: "https://utfs.io/f/06736ce1-7db8-40ba-8817-d1ed03c77a48-eeahjm.jpg",
		text: "早已褪去色彩的厚質絲綢、隨手拉扯都將脫線消失的龍虎刺繡，只是指尖輕觸這條腰帶，回憶便波濤洶湧而來，將我帶回曾經的武術賽場，強烈的心跳聲猶在耳旁，場邊此起彼落的加油聲不斷，卻使得接下來的失誤更加唐突與荒謬。\n從小習武的我，憑著那要強而不想落人一節的個性總得到不錯的成績，久而久之比賽便成了我生活的重心，得到的肯定使我更加地認為自己能夠主宰賽場，我總是穿著比別人亮麗百倍的戰袍，尤其腰上那條深褐色並繡有青龍白虎的絲綢亮面腰帶，就向我的傲氣般，鋒芒畢露。\n六年級的那場比賽，我如往常般氣定神閒的走上賽場，舉起手中的傳統劍，它像練習時一樣行雲流水的穿過每個角落，就在我扎下馬步預備要拋劍敬禮時，劍的末端不偏不倚地從腰帶上的結刺過，收尾的那最後一刻裡，我的耳中只迴盪著劍重重與地板碰撞的聲響，還有腰上消失的緊繃感。\n傲慢的孔雀最終因自己的羽毛而被擒拿，在那場重挫我的失敗後，我緊抓著自己的腰帶走下了台，氣憤和委屈無處宣洩，我一條條的將腰帶上的線絲拉起，好似能抹去失誤般，可我再清楚不過，都是自己的虛榮心將我推向了萬丈深淵——教練早就告訴過我厚質的絲綢腰帶占的面積更大，兵器操作",
	},
	{
		name: "中文橫書社論",
		imageUrl: "https://utfs.io/f/294c1d7d-5392-443f-94f6-5b98e4893ae0-8h2wb8.jpg",
		text: "站在攻勢現實主義的立場上，中國與美國都是在國際體系中競爭權力的位置。因此，想要吸引習近平來到美國領土，並參加川普的就職典禮，就必須提出讓習近平能夠感受到在國際地位上有利可圖的方式，但作為川普的幕僚，又不能讓川普感覺到自己的利益受到侵犯。因此要先分析中國與美國各自在乎什麼利益，並了解為什麼川普要邀請習近平來參與就職典禮。\n先就川普對中態度而言，川普長期以來對中國在貿易上的優勢感到不滿，而作為商人的川普，必定懂得商戰的心法。川普一方面想削弱中國對美國乃至對世界經濟的影響，並想強化美國在國際經濟的地位；另一方面，川普又不能施以完全強烈且直接的手段，對中國進行制裁(雖然在美中貿易戰時，美國已採取過強烈的關稅政策)，但經過一次選戰的失敗，川普在這四年當中必定沉澱了一些過往的經驗，因此這次想以明柔暗剛的方式對中國採取新的政策。",
	},
	{
		name: "中文橫書 LaTeX 數學推導",
		imageUrl: "https://utfs.io/f/4491c621-19e0-4721-8e15-44b71625ab4f-ylh5w.png",
		text: "1. 球原本就在轉動，所以是動摩擦力。\n2. 動摩擦力產生與轉動方向相反的力矩，使 $\\omega$ 下降，並使 $v_0$ 上升。\n3. $ v = R\\omega $\n4. Due to (2)，我得摩擦力使 $ v_0 $ 上升：\n   \n   \\[\n   f_k = \\mu_k Mg =M a \\Rightarrow a = \\mu_k g \\quad \\& \\quad v_0 = 0\n   \\]\n   \n   則 $v = \\mu_k g t$\n5. \n   \\[\n   \\tau_f = -f_k R = -\\mu_kMgR = I \\alpha\n   \\]\n   \n   \\[\n   \\rightarrow \\quad \\alpha=\\frac{-\\mu_kMgR}{I} ,實心球的轉動慣量(I= \\frac{2}{5} MR^2)\n   \\]\n   \n   \\[\n   \\rightarrow \\quad \\alpha = \\frac{-\\mu_kMgR}{\\frac{2}{5} MR^2} = \\frac{-5}{2} \\frac{\\mu_k g}{R}\n   \\]\n   and formula $(\\omega = \\omega_0 + \\alpha t)$\n   so $\\omega = \\omega_0 - \\frac{5}{2} \\left(\\frac{\\mu_k g}{R} \\right) t$\n6. 純滾動 satisfy the condition : $ v = R\\omega$  \\& (4)(5)的答案\n   \\[\n   \\mu_k g t = R \\left( \\omega_0 - \\frac{5}{2} (\\frac{\\mu_k g}{R}) t \\right)\n   \\]\n   \\[\n   \\rightarrow \\frac{7}{2}(\\frac{\\mu_k g}{R}t)=R \\omega_0\\quad,so\\quad t=\\frac{2}{7}\\frac{R\\omega_0}{\\mu_k g}代回formula (\\omega = \\omega_0 + \\alpha t)\n   \\]\n   \\[\n   \\omega = \\frac{2}{7} \\omega_0_\\quad_{\\#}\n   \\]\n\n一開始球還在空中的時候，球的動能完全是旋轉動能，接著因為表面與球有 $f_k$ 的存在，$f_k$ 增加 $v_{\\text{cm}}$ ，同時  $f_k$  所產生的力矩使球的轉速下降。當球不再滑動，也就是純滾動時， $v = R\\omega$，$ f_k = 0$ ，能量不會再減少。",
	},
	{
		name: "英文橫書 LaTeX 數學推導",
		imageUrl: "https://utfs.io/f/0bba978f-9cfe-43d3-a93d-85b599b25262-tl599o.png",
		text: "29.\nE in flywheels  $$7.7 \\times 10^4 \\, \\text{kg}$$  radius= $$2.4 \\, \\text{m}$$  , shaft  $$ r = \\frac{41}{2} \\text{ cm} $$  \n$$ F = 34 \\text{kN} $$ act tan on the shaft  , stop from $$ 360 \\, \\text{rpm} $$? \n\n\\[\n\\tau = r F \\sin \\theta = R_{\\text{shaft}}\\cdot f_k=\\frac{41}{2}\\times10^{-2}\\cdot34\\cdot10^3=\n\\]\n\\[\n\\tau = I \\alpha\n\\]\n\\[\nI_{\\text{fw}} = \\frac{1}{2} M \\times R^2 = \\frac{1}{2} \\times 7.7 \\times 10^4 \\times 2.4^2\n\\]\n\\[\nW_{\\text{final}} =0= W_0 + \\frac{a}{k} t\n\\]\n\\[\nt = \\frac{-W_0}{\\alpha} = +\\frac{W_0 I_{\\text{fw}}}{\\tau}= \\frac{W_0 M_{\\text{fw}} R_{\\text{fw}}^2}{2 R_{\\text{shaft}} f_k}\n\\]\n\\[\n= \\frac{360 \\times 7.7 \\times 10^4 \\cdot 2.4^2}{2 \\times 34 \\times 10^3 \\cdot 0.205}\\times\\frac{2\\pi \\quad rad}{180}\\times\\frac{1}{60}\n\\]\n\\[\n= 1200 \\text{s} = 20 \\text{min}\n\\]\n\n(3) \\subsection*{Energy Stored at 360 rpm ?}\n(4)\\subsection*{Power Output when 360 $\\rightarrow$ 300 rpm in 3 s}\n\\[\n\\omega = \\frac{1}{2} I \\omega^2 = \\frac{1}{4} m R^2 \\omega^2= \\frac{1}{4} \\times 7.7 \\times 10^4 \\times 2.4^2 \\times  360^2 \\times\\left( \\frac{2\\pi}{60} \\right)^2=1.6\\times10^8 J\n\\]\n\n\\[\n(4) \\quad\\bar{P} = \\frac{\\Delta K}{\\Delta t} = \\frac{7.7 \\times 10^4 \\times 2.4^2}{4\\quad\\Delta t}  \\left( 300^2 - 360^2 \\right) \\left(\\frac{2\\pi}{60}\\right)^2\n\\]\n\\[\n= 16 \\text{MW}\n\\]",
	},
];



export function CreateTestDataDialog({ open, onOpenChange, onSubmit }: CreateTestDataDialogProps) {
	const [activeTab, setActiveTab] = useState("examples");
	const [isLoading, setIsLoading] = useState(false);
	const [testAreaName, setTestAreaName] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [groundTruth, setGroundTruth] = useState("");

	// CSV 相關狀態
	const [csvData, setCsvData] = useState<any[]>([]);
	const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
	const [isCsvDialogOpen, setIsCsvDialogOpen] = useState(false);

	// 處理選擇 CSV 行
	const handleSelectCsvRow = useCallback(() => {
		if (selectedRowIndex === null || !csvData[selectedRowIndex]) {
			  toast("未選擇數據", { description: "請選擇一行數據" });
			return;
		}

		const selectedRow = csvData[selectedRowIndex]
		const rowImageUrl = selectedRow.imageUrl || selectedRow.image_url || selectedRow.url || ""
		const rowText =
			selectedRow.text || selectedRow.groundTruth || selectedRow.ground_truth || selectedRow.expected || ""
		const rowName = selectedRow.name || `測試區 ${new Date().toLocaleString()}`

		if (rowImageUrl && rowText) {
			setImageUrl(rowImageUrl)
			setGroundTruth(rowText)
			setTestAreaName(rowName)
			setIsCsvDialogOpen(false)
			toast("CSV 數據已選擇", { description: `已選擇第 ${selectedRowIndex + 1} 行數據` });
		} else {
			toast("無效的數據", { description: "選擇的行缺少圖片 URL 或文本" });
		}
	}, [csvData, selectedRowIndex, setImageUrl, setGroundTruth, setTestAreaName, setIsCsvDialogOpen, toast])

	// 重置表單
	useEffect(() => {
		if (open) {
			setTestAreaName("")
			setImageUrl("")
			setGroundTruth("")
			setActiveTab("examples")
			setSelectedRowIndex(null)
			setCsvData([])
		}
	}, [open])

	// 處理表單提交
	const handleSubmit = () => {
		if (!testAreaName.trim()) {
			//   toast({
			//     title: "請輸入名稱",
			//     description: "測試區名稱不能為空",
			//     variant: "destructive",
			//   })
			return
		}

		if (!imageUrl) {
			//   toast({
			//     title: "請提供圖片",
			//     description: "請輸入圖片 URL 或上傳圖片",
			//     variant: "destructive",
			//   })
			return
		}

		if (!groundTruth.trim()) {
			//   toast({
			//     title: "請輸入預期文本",
			//     description: "預期 OCR 文本不能為空",
			//     variant: "destructive",
			//   })
			return
		}

		onSubmit({
			name: testAreaName,
			imageUrl,
			groundTruth,
		})
	}

	// 處理文件上傳
	// const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const file = e.target.files?.[0]
	// 	if (!file) return

	// 	setIsLoading(true)
	// 	try {
	// 		// Convert file to base64
	// 		const base64 = await fileToBase64(file)
	// 		setImageUrl(base64)

	// 		//   toast({
	// 		//     title: "圖片已上傳",
	// 		//     description: "圖片已轉換為 base64 格式並準備使用。",
	// 		//   })
	// 	} catch (error) {
	// 		//   toast({
	// 		//     title: "上傳失敗",
	// 		//     description: error instanceof Error ? error.message : "發生未知錯誤",
	// 		//     variant: "destructive",
	// 		//   })
	// 	} finally {
	// 		setIsLoading(false)
	// 	}
	// }

	// Helper function to convert file to base64
	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result as string)
			reader.onerror = (error) => reject(error)
		})
	}

	// 處理 CSV 上傳
	// const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
	// 	const file = e.target.files?.[0]
	// 	if (!file) return

	// 	setIsLoading(true)

	// 	const reader = new FileReader()
	// 	reader.onload = (event: ProgressEvent<FileReader>) => {
	// 		try {
	// 			const csvText = event.target?.result as string

	// 			Papa.parse(csvText, {
	// 				header: true,
	// 				complete: (results) => {
	// 					console.log("Parsed CSV:", results)

	// 					if (results.data.length > 0) {
	// 						// 設置 CSV 數據並打開選擇對話框
	// 						setCsvData(results.data)
	// 						setIsCsvDialogOpen(true)
	// 					} else {
	// 						//   toast({
	// 						//     title: "CSV 為空",
	// 						//     description: "CSV 文件中沒有數據。",
	// 						//     variant: "destructive",
	// 						//   })
	// 					}
	// 				},
	// 				error: (error) => {
	// 					console.error("CSV parsing error:", error)
	// 					// toast({
	// 					//   title: "解析 CSV 錯誤",
	// 					//   description: error.message,
	// 					//   variant: "destructive",
	// 					// })
	// 				},
	// 			})
	// 		} catch (error) {
	// 			console.error("Error processing CSV:", error)
	// 			// toast({
	// 			//   title: "處理 CSV 錯誤",
	// 			//   description: error instanceof Error ? error.message : "未知錯誤",
	// 			//   variant: "destructive",
	// 			// })
	// 		} finally {
	// 			setIsLoading(false)
	// 		}
	// 	}

	// 	reader.onerror = () => {
	// 		//   toast({
	// 		//     title: "讀取文件錯誤",
	// 		//     description: "無法讀取上傳的文件",
	// 		//     variant: "destructive",
	// 		//   })
	// 		setIsLoading(false)
	// 	}

	// 	reader.readAsText(file)
	// }

	// 使用預設測試範例
	const useDefaultExample = (index: number) => {
		const example = DEFAULT_EXAMPLES[index]
		setTestAreaName(example.name)
		setImageUrl(example.imageUrl)
		setGroundTruth(example.text)

		// toast({
		//   title: "已加載預設範例",
		//   description: `已導入預設測試範例: ${example.name}`,
		// })
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl">
				<DialogHeader>
					<DialogTitle>創建新測試區</DialogTitle>
					<DialogDescription>創建一個新的 OCR 測試區，用於測試和比較不同模型的 OCR 能力。</DialogDescription>
				</DialogHeader>

				<ScrollArea className="py-4 max-h-[60svh]">
					<div className="space-y-2 mb-4">
						<Label htmlFor="test-area-name">測試區名稱</Label>
						<Input
							id="test-area-name"
							placeholder="輸入測試區名稱"
							value={testAreaName}
							onChange={(e) => setTestAreaName(e.target.value)}
						/>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="examples">預設範例</TabsTrigger>
							<TabsTrigger value="manual">手動輸入</TabsTrigger>
							<TabsTrigger value="upload">上傳文件</TabsTrigger>
						</TabsList>

						{/* 預設範例 */}
						<TabsContent value="examples" className="space-y-4 py-2">
							<div className="grid gap-2">
								{DEFAULT_EXAMPLES.map((example, index) => (
									<Button
										key={index}
										variant="outline"
										className="justify-start h-auto py-3 px-4"
										onClick={() => useDefaultExample(index)}
									>
										<div className="grid text-start">
											<span className="font-medium text-base">{example.name}</span>
											<Muted className="truncate">{example.text}</Muted>
										</div>
									</Button>
								))}
							</div>
						</TabsContent>

						{/* 手動輸入 */}
						<TabsContent value="manual" className="space-y-4 py-2">
							{/* <div className="space-y-2">
								<Label htmlFor="image-url">圖片 URL 或 Base64</Label>
								<Input
									id="image-url"
									placeholder="輸入圖片 URL 或粘貼 base64 數據"
									value={imageUrl}
									onChange={(e) => setImageUrl(e.target.value)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="ground-truth">預期 OCR 文本</Label>
								<Textarea
									id="ground-truth"
									placeholder="輸入預期的 OCR 文本輸出..."
									value={groundTruth}
									onChange={(e) => setGroundTruth(e.target.value)}
									rows={6}
								/>
							</div> */}
							<p className="text-center">暫時隱藏</p>
						</TabsContent>

						{/* 上傳文件 */}
						<TabsContent value="upload" className="space-y-4 py-2">
							{/* <div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<Label className="mb-2 block">上傳圖片</Label>
										<Button variant="outline" className="w-full" asChild disabled={isLoading}>
											<label>
												<Upload className="h-4 w-4 mr-2" />
												{isLoading ? "處理中..." : "選擇圖片文件"}
												<input
													type="file"
													className="hidden"
													accept="image/*"
													onChange={handleFileUpload}
													disabled={isLoading}
												/>
											</label>
										</Button>
									</div>

									<div>
										<Label className="mb-2 block">上傳 CSV</Label>
										<Button variant="outline" className="w-full" asChild disabled={isLoading}>
											<label>
												<Upload className="h-4 w-4 mr-2" />
												{isLoading ? "處理中..." : "選擇 CSV 文件"}
												<input
													type="file"
													className="hidden"
													accept=".csv"
													onChange={handleCsvUpload}
													disabled={isLoading}
												/>
											</label>
										</Button>
									</div>
								</div>

								<div className="text-xs text-muted-foreground">
									CSV 文件應包含 imageUrl 和 text 列。將使用第一行數據。
								</div>
							</div> */}
							<p className="text-center">暫時隱藏</p>
						</TabsContent>
					</Tabs>

					{imageUrl && (
						<div className="mt-4">
							<Label className="mb-2 block">圖片預覽</Label>
							<ImagePreview url={imageUrl} />
						</div>
					)}
				</ScrollArea>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						取消
					</Button>
					<Button onClick={handleSubmit}>創建測試區</Button>
				</DialogFooter>
			</DialogContent>

			{/* CSV 數據選擇對話框 */}
			<Dialog open={isCsvDialogOpen} onOpenChange={setIsCsvDialogOpen}>
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
					<DialogHeader>
						<DialogTitle>選擇 CSV 數據行</DialogTitle>
						<DialogDescription>請選擇要用於測試的數據行</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-auto my-4">
						{csvData.length > 0 ? (
							<div className="space-y-4">
								<RadioGroup
									value={selectedRowIndex !== null ? selectedRowIndex.toString() : undefined}
									onValueChange={(value) => setSelectedRowIndex(Number.parseInt(value))}
								>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-[50px]">選擇</TableHead>
												<TableHead>行號</TableHead>
												<TableHead>圖片 URL</TableHead>
												<TableHead>文本</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{csvData.map((row, index) => {
												const imageUrl = row.imageUrl || row.image_url || row.url || ""
												const text = row.text || row.groundTruth || row.ground_truth || row.expected || ""

												return (
													<TableRow key={index} className={selectedRowIndex === index ? "bg-muted/50" : ""}>
														<TableCell>
															<RadioGroupItem value={index.toString()} id={`row-${index}`} />
														</TableCell>
														<TableCell>{index + 1}</TableCell>
														<TableCell className="max-w-[300px] truncate">{imageUrl}</TableCell>
														<TableCell className="max-w-[300px] truncate">{text}</TableCell>
													</TableRow>
												)
											})}
										</TableBody>
									</Table>
								</RadioGroup>
							</div>
						) : (
							<div className="text-center py-8 text-muted-foreground">沒有 CSV 數據可顯示</div>
						)}
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setIsCsvDialogOpen(false)}>
							取消
						</Button>
						<Button onClick={handleSelectCsvRow} disabled={selectedRowIndex === null}>
							使用選中的數據
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Dialog>
	)
}