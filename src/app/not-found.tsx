import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - 頁面未找到</h1>
      <p className="text-lg mb-6">抱歉，您請求的頁面不存在。</p>
      <Link href="/" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        返回首頁
      </Link>
    </div>
  )
}
