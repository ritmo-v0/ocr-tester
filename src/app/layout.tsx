// Styles
import "@/app/globals.css";

import Providers from "@/lib/providers";
import { getBaseUrl, generatePreviewMetadata } from "@/lib/utils";

// Components & UI
import Navbar from "@/components/common/navbar";

// Fonts
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Noto_Sans_TC } from "next/font/google";
const NotoSansTC = Noto_Sans_TC({
	weight: "variable",
	style: ["normal"],
	display: "swap",
	subsets: ["latin"],
	variable: "--font-noto-sans-tc",
});

// Types & Interfaces
import { Metadata } from "next";

// Metadata
const title = "OCR Tester";
const description = "Test and compare OCR capabilities of different AI models.";
const url = "/";
const author = "Outegral Studio";
export const metadata: Metadata = {
    metadataBase: getBaseUrl(),
    title: {
        default: title,
        template: `%s｜${title}`,
    },
	description,
	applicationName: title,
	category: "AI Application",
	keywords: ["AI", "OCR"],
	authors: [{ name: author }],
	creator: author,
	publisher: author,
    ...generatePreviewMetadata({ title, description, url }),
	robots: {
		index: true,
		follow: true,
		nocache: false,
	},
};

export default function RootLayout({ children }: React.ComponentProps<"html">) {
	return (
		<html
			lang="zh-Hant-TW"
			className={`${GeistSans.variable} ${GeistMono.variable} ${NotoSansTC.variable}`}
			suppressHydrationWarning
		>
			{/* <head>
				<script src="https://unpkg.com/react-scan/dist/auto.global.js" async />
			</head> */}
			<body>
				<Providers>
					<Navbar />
					{children}
				</Providers>
			</body>
		</html>
	);
}
