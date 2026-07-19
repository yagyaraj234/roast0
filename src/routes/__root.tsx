import {
	createRootRoute,
	HeadContent,
	Link,
	Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	notFoundComponent: RootNotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#ffffff" },
			{ title: "Helix — AI Agent Cost & Risk Scanner" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap",
			},
			{
				rel: "stylesheet",
				href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap",
			},
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
			{ rel: "manifest", href: "/manifest.json" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<HeadContent />
			</head>
			<body suppressHydrationWarning>
				{children}
				<Scripts />
			</body>
		</html>
	);
}

function RootNotFound() {
	return (
		<main className="grid min-h-svh place-content-center gap-6 bg-white px-8">
			<p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
				404 · Page not found
			</p>
			<h1 className="text-5xl font-semibold tracking-tight text-ink">
				Nothing here.
			</h1>
			<div>
				<Link
					className="inline-flex items-center justify-center rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.97]"
					to="/"
				>
					Back to Helix
				</Link>
			</div>
		</main>
	);
}
