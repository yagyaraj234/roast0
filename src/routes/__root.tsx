import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import shellCss from "../shells.css?url";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "theme-color", content: "#0c0a09" },
			{ title: "Roast0 — agent trace intelligence" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "stylesheet", href: shellCss },
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
				href: "https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap",
			},
			{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
