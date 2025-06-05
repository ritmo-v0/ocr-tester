"use client"
import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useNicknameStore } from "@/lib/store/ocr";

// Components & UI
import { OcrTestingInterface } from "@/components/ocr-testing-interface";
import { toast } from "sonner";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/common/typography";
import { WrapperLayout } from "@/components/common/layouts";

// Icons & Images
import { Home, User } from "lucide-react";

// Types & Interfaces
import type { OcrTestingState } from "@/types/ocr-types";
import type { TestAreaWithData } from "@/types/test-area-types";



export default function TestInterfacePage() {
	const router = useRouter();
	const params = useParams();
	const nickname = useNicknameStore(state => state.nickname);

	const [testArea, setTestArea] = useState<TestAreaWithData | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const id = params.id as string;

	// Get nickname from localStorage and load test area by ID
	useEffect(() => {
		const nickname = JSON.parse(localStorage.getItem("user-nickname") ?? "{}")?.state?.nickname;
		if (!nickname) {
			router.push("/");
			return;
		}

		const loadTestArea = () => {
			try {
				setIsLoading(true)
				const areaData = localStorage.getItem(`ocr-test-area-${id}`)

				if (!areaData) {
					toast.error("測試區不存在", { description: "找不到指定的測試區" });
					router.push("/test-data-config-menu")
					return
				}

				const area = JSON.parse(areaData) as TestAreaWithData
				setTestArea(area)
			} catch (error) {
				console.error("加載測試區失敗:", error)
				toast.error("加載失敗", { description: "無法加載測試區數據" });
				router.push("/test-data-config-menu")
			} finally {
				setIsLoading(false)
			}
		}

		if (id) {
			loadTestArea()
		}
	}, [id, router, toast])

	// 保存測試區數據 - 使用 useCallback 避免不必要的重新創建
	const handleStateChange = useCallback(
		(newState: OcrTestingState) => {
			if (!testArea) return

			try {
				// 創建更新後的測試區
				const updatedArea: TestAreaWithData = {
					...testArea,
					imageUrl: newState.imageUrl,
					groundTruth: newState.groundTruth,
					versions: newState.versions,
					activeVersionId: newState.activeVersionId,
					updatedAt: new Date().toISOString(),
				}

				// 保存到 localStorage
				localStorage.setItem(`ocr-test-area-${id}`, JSON.stringify(updatedArea))

				// 更新本地狀態 - 但不觸發重新渲染
				setTestArea(updatedArea)
			} catch (error) {
				console.error("保存測試區失敗:", error)
				toast.error("保存失敗", { description: "無法保存測試區數據" });
			}
		},
		[testArea, id, toast],
	);

	return (
		<WrapperLayout className="py-6" width={1800}>
			<div className="flex max-sm:flex-col sm:justify-between mb-6">
				<TestInterfaceBreadcrumb id={id} name={testArea?.name} />
				<Muted className="flex items-center gap-1">
					<User className="inline size-4" />
					{nickname}
					<ChangeNickNameButton />
				</Muted>
			</div>

			{isLoading ? (
				<div className="flex items-center justify-center min-h-[60vh]">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
				</div>
			) : testArea ? (
				<OcrTestingInterface
					initialState={{
						imageUrl: testArea.imageUrl,
						groundTruth: testArea.groundTruth,
						versions: testArea.versions || [],
						modelConfigs: [
							{ provider: "openai", model: "gpt-4o", enabled: true },
							{ provider: "openai", model: "gpt-4o-mini", enabled: false },
							{ provider: "gemini", model: "gemini-2.0-flash", enabled: true },
							{ provider: "gemini", model: "gemini-2.0-flash-lite", enabled: false },
							{ provider: "gemini", model: "gemini-2.0-pro-exp-02-05", enabled: false },
						],
						activeVersionId: testArea.activeVersionId,
						testCases: [],
						nextVersionNumber: testArea.versions?.length
							? Math.max(...testArea.versions.map((v) => v.versionNumber)) + 1
							: 1,
					}}
					onStateChange={handleStateChange}
				/>
			) : (
				<div className="text-center py-12">
					<h2 className="text-xl font-bold mb-4">測試區不存在</h2>
					<Button onClick={() => router.push("/test-data-config-menu")}>返回測試區列表</Button>
				</div>
			)}
		</WrapperLayout>
	)
}

function TestInterfaceBreadcrumb({ id, name }: { id: string, name?: string }) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href="/dashboard" className="flex items-center">
						<Home className="size-4 mr-2" />
						我的 OCR 測試區
					</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbLink href={`/testarea/${id}`}>{name || "測試區"}</BreadcrumbLink>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>
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
			className="h-auto p-0"
			onClick={handleClick}
		>
			(更換暱稱)
		</Button>
	);
}