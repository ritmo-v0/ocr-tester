import { cn } from "@/lib/utils";

// Types & Interfaces
interface WrapperLayoutProps extends React.ComponentProps<"div"> {
	width?: number;
}



function WrapperLayout({ children, className, width = 1400 }: WrapperLayoutProps) {
	return (
		<div
			style={{ "--wrapper-width": `${width}px` } as React.CSSProperties}
			className={cn(
				"@container mx-auto [--wrapper-padding:_2rem] sm:[--wrapper-padding:_4rem] w-[min(calc(100%_-_var(--wrapper-padding)),_var(--wrapper-width))]",
				className
			)}
		>
			{children}
		</div>
	);
};

export { WrapperLayout };