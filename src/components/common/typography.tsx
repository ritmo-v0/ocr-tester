import { cn } from "@/lib/utils";

// Components & UI
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";



function H1({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h1"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h1";

	return <Comp className={cn("scroll-m-20 font-heading text-3xl font-bold tracking-tight lg:text-4xl", className)} {...props} />;
}

function H2({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h2"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h2";

	return <Comp className={cn("scroll-m-20 font-heading border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0", className)} {...props} />;
}

function H3({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h3"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h3";

	return <Comp className={cn("scroll-m-20 font-heading text-xl font-semibold tracking-tight", className)} {...props} />;
}

function H4({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h4"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h4";

	return <Comp className={cn("scroll-m-20 font-heading text-lg font-semibold tracking-tight", className)} {...props} />;
}

function H5({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h5"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h5";

	return <Comp className={cn("scroll-m-20 font-heading text-base font-medium tracking-tight", className)} {...props} />;
}

function H6({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"h6"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "h6";

	return <Comp className={cn("scroll-m-20 font-heading text-sm font-medium tracking-tight", className)} {...props} />;
}

function P({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "p";

	return <Comp className={cn("leading-7 [&:not(:first-child)]:mt-4", className)} {...props} />;
}

function Muted({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"p"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "p";

	return <Comp className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function Anchor({
	className,
	href,
	...props
}: React.ComponentProps<"a"> & { href: string }) {
	return (
		<Link
			href={href}
			className={cn("font-medium text-primary underline underline-offset-4", className)}
			{...props}
		/>
	);
}

export { H1, H2, H3, H4, H5, H6, P, Muted, Anchor }