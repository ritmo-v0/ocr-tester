// Types & Interfaces
import { Metadata } from "next";

// Metadata
const title = "測試界面";
export const metadata: Metadata = {
	title,
};



export default function DashboardLayout({ children }: React.ComponentProps<"div">) {
	return children;
}