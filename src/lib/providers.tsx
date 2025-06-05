import { ThemeProvider } from "next-themes";

// Components & UI
import { Toaster } from "@/components/ui/sonner";



export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			{children}
			<Toaster />
		</ThemeProvider>
	);
}