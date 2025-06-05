"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNicknameStore } from "@/lib/store/ocr";
import { nanoid } from "nanoid";
import { formatDistanceToNow } from "date-fns";
import { zhTW } from "date-fns/locale";
import { cn } from "@/lib/utils";

// Components & UI
import { TestDataTable } from "@/components/test-data-table";
import { CreateTestDataDialog } from "@/components/create-test-data-dialog";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { H1, Muted } from "@/components/common/typography";
import { WrapperLayout } from "@/components/common/layouts";

// Icons & Images
import {
	Copy,
	Download,
	ExternalLink,
	Plus,
	Trash2,
	User,
} from "lucide-react";

// Types & Interfaces
import type { TestArea, TestAreaWithData } from "@/types/test-area-types";



export default function DashboardPage() {
	const router = useRouter();

	const [testAreas, setTestAreas] = useState<TestAreaWithData[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	// Get nickname from localStorage and load test areas
	useEffect(() => {
		const nickname = JSON.parse(localStorage.getItem("user-nickname") ?? "{}")?.state?.nickname;
		if (!nickname) {
			router.push("/");
			return;
		}

		function loadTestAreas() {
			try {
				// 獲取所有測試區的索引
				const testAreaIndex = localStorage.getItem("ocr-test-areas-index")
				if (!testAreaIndex) {
					return []
				}

				const testAreaIds = JSON.parse(testAreaIndex) as string[]

				// 獲取每個測試區的詳細信息
				const areas = testAreaIds
					.map((id) => {
						const areaData = localStorage.getItem(`ocr-test-area-${id}`)
						if (!areaData) return null

						const area = JSON.parse(areaData) as TestAreaWithData
						return area
					})
					.filter(Boolean) as TestAreaWithData[]

				setTestAreas(areas)
			} catch (error) {
				console.error("加載測試區失敗:", error)
				toast.error("加載失敗", { description: "無法加載測試區數據" })
				return []
			}
		}

		loadTestAreas()
	}, [router, toast])

	// 創建新測試區
	const handleCreateTestArea = (testArea: TestArea) => {
		try {
			// 生成新的測試區數據
			const newTestArea: TestAreaWithData = {
				...testArea,
				id: nanoid(7),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				versions: [],
				activeVersionId: null,
			}

			// 更新測試區索引
			const testAreaIndex = localStorage.getItem("ocr-test-areas-index")
			const testAreaIds = testAreaIndex ? (JSON.parse(testAreaIndex) as string[]) : []
			testAreaIds.push(newTestArea.id)
			localStorage.setItem("ocr-test-areas-index", JSON.stringify(testAreaIds))

			// 保存新測試區
			localStorage.setItem(`ocr-test-area-${newTestArea.id}`, JSON.stringify(newTestArea))

			// 更新狀態
			setTestAreas((prev) => [...prev, newTestArea])

			toast("創建成功", { description: `測試區 "${newTestArea.name}" 已創建` });

			// 關閉對話框
			setIsDialogOpen(false)

			// 導航到新測試區
			router.push(`/testarea/${newTestArea.id}`)
		} catch (error) {
			console.error("創建測試區失敗:", error);
			toast.error("創建失敗", { description: "無法創建新測試區" });
		}
	}

	// 刪除測試區
	const handleDeleteTestArea = (id: string) => {
		try {
			// 更新測試區索引
			const testAreaIndex = localStorage.getItem("ocr-test-areas-index")
			if (testAreaIndex) {
				const testAreaIds = JSON.parse(testAreaIndex) as string[]
				const updatedIds = testAreaIds.filter((areaId) => areaId !== id)
				localStorage.setItem("ocr-test-areas-index", JSON.stringify(updatedIds))
			}

			// 刪除測試區數據
			localStorage.removeItem(`ocr-test-area-${id}`)

			// 更新狀態
			setTestAreas((prev) => prev.filter((area) => area.id !== id))

			toast("刪除成功", { description: "測試區已刪除" });
		} catch (error) {
			console.error("刪除測試區失敗:", error);
			toast("刪除失敗", { description: "無法刪除測試區" });
		}
	}

	// 複製測試區
	const handleDuplicateTestArea = (id: string) => {
		try {
			// 獲取原測試區數據
			const areaData = localStorage.getItem(`ocr-test-area-${id}`)
			if (!areaData) {
				throw new Error("測試區數據不存在")
			}

			const originalArea = JSON.parse(areaData) as TestAreaWithData

			// 創建複製的測試區
			const duplicatedArea: TestAreaWithData = {
				...originalArea,
				id: nanoid(7),
				name: `${originalArea.name} (複製)`,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			}

			// 更新測試區索引
			const testAreaIndex = localStorage.getItem("ocr-test-areas-index")
			const testAreaIds = testAreaIndex ? (JSON.parse(testAreaIndex) as string[]) : []
			testAreaIds.push(duplicatedArea.id)
			localStorage.setItem("ocr-test-areas-index", JSON.stringify(testAreaIds))

			// 保存複製的測試區
			localStorage.setItem(`ocr-test-area-${duplicatedArea.id}`, JSON.stringify(duplicatedArea))

			// 更新狀態
			setTestAreas((prev) => [...prev, duplicatedArea])

			toast("複製成功", { description: `測試區 "${duplicatedArea.name}" 已創建` });
		} catch (error) {
			console.error("複製測試區失敗:", error);
			toast.error("複製失敗", { description: "無法複製測試區" });
		}
	}

	// 下載測試區數據
	const handleDownloadTestArea = (id: string) => {
		try {
			// 獲取測試區數據
			const areaData = localStorage.getItem(`ocr-test-area-${id}`)
			if (!areaData) {
				throw new Error("測試區數據不存在")
			}

			const area = JSON.parse(areaData) as TestAreaWithData

			// 創建下載文件
			const blob = new Blob([JSON.stringify(area, null, 2)], { type: "application/json" })
			const url = URL.createObjectURL(blob)
			const a = document.createElement("a")
			a.href = url
			a.download = `ocr-test-area-${area.name}-${new Date().toISOString().slice(0, 10)}.json`
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
			URL.revokeObjectURL(url)

			toast("下載成功", { description: "測試區數據已下載" });
		} catch (error) {
			console.error("下載測試區失敗:", error);
			toast.error("下載失敗", { description: "無法下載測試區數據" });
		}
	}

	// 打開測試區
	const handleOpenTestArea = (id: string) => {
		router.push(`/testarea/${id}`);
	}

	return (
		<WrapperLayout className="py-8">
			<DashboardHeader className="mb-6">
				<Button className="w-fit" onClick={() => setIsDialogOpen(true)}>
					<Plus />
					新增測試區
				</Button>
			</DashboardHeader>

			<Card>
				<CardHeader>
					<CardTitle>測試區列表</CardTitle>
					<CardDescription>管理您的 OCR 測試區</CardDescription>
				</CardHeader>
				<CardContent>
					{testAreas.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p className="mb-4">您還沒有創建任何測試區</p>
							<Button onClick={() => setIsDialogOpen(true)}>
								<Plus />
								創建第一個測試區
							</Button>
						</div>
					) : (
						<TestDataTable
							data={testAreas.map((area) => ({
								id: area.id,
								name: area.name,
								updatedAt: formatDistanceToNow(new Date(area.updatedAt), {
									addSuffix: true,
									locale: zhTW,
								}),
								actions: (
									<div className="flex items-center gap-2">
										<Button variant="ghost" size="icon" onClick={() => handleOpenTestArea(area.id)}>
											<ExternalLink />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => handleDuplicateTestArea(area.id)}>
											<Copy />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => handleDownloadTestArea(area.id)}>
											<Download />
										</Button>
										<Button variant="ghost" size="icon" onClick={() => handleDeleteTestArea(area.id)}>
											<Trash2 />
										</Button>
									</div>
								),
							}))}
							onRowClick={(id) => handleOpenTestArea(id)}
						/>
					)}
				</CardContent>
			</Card>

			<CreateTestDataDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				onSubmit={handleCreateTestArea}
			/>
		</WrapperLayout>
	)
}

function DashboardHeader({ className, children }: React.ComponentProps<"header">) {
	const nickname = useNicknameStore(state => state.nickname);

	return (
		<header className={cn("self-center flex max-sm:flex-col sm:items-center justify-between gap-2 w-full h-min", className)}>
			<div>
				<H1>我的 OCR 測試區</H1>
				<Muted className="flex items-center gap-1">
					<User className="inline size-4" />
					歡迎，{nickname}
					<ChangeNickNameButton />
				</Muted>
			</div>
			{children}
		</header>
	);
}

function ChangeNickNameButton() {
	const router = useRouter();
	const setNickname = useNicknameStore(state => state.setNickname);

	function handleClick() {
		setNickname("");
		router.push("/");
	}

	return (
		<Button
			variant="link"
			size="sm"
			className="p-0"
			onClick={handleClick}
		>
			(更換暱稱)
		</Button>
	);
}