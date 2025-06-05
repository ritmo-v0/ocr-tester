// Components & UI
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";



export default function Navbar() {
	return (
		<nav className="sticky top-0 h-14 px-4 sm:px-8 bg-background border-b z-50">
			<div className="flex items-center justify-between gap-4 mx-auto max-w-[1400px] h-full">
				<Link href="/" className="font-bold">OCR 測試系統</Link>
				<ThemeToggle />
			</div>
		</nav>
	);
}