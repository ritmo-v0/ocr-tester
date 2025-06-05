// Types & Interfaces
import { Metadata } from "next";

// Metadata
const title = "儀表板";
export const metadata: Metadata = {
	title,
};



export default function DashboardLayout({ children }: React.ComponentProps<"div">) {
	return children;
}