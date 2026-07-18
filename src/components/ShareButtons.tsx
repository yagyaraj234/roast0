import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

import {
	fallbackRoastLine,
	formatShareText,
	type PublicRoast,
} from "../lib/public-roasts";

export function ShareButtons({ roast }: { roast: PublicRoast }) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
		"idle",
	);

	async function copyRoast(): Promise<void> {
		try {
			await navigator.clipboard.writeText(
				formatShareText(roast, window.location.href),
			);
			setCopyState("copied");
		} catch {
			setCopyState("failed");
		}
	}

	async function shareRoast(): Promise<void> {
		if (!navigator.share) return copyRoast();
		try {
			await navigator.share({
				title: `${roast.score}/100 · ${roast.tier} · Flint`,
				text: roast.roastLine ?? fallbackRoastLine(roast.tier),
				url: window.location.href,
			});
		} catch (error) {
			if (error instanceof DOMException && error.name === "AbortError") return;
			setCopyState("failed");
		}
	}

	return (
		<div className="share-actions">
			<button type="button" onClick={copyRoast}>
				{copyState === "copied" ? (
					<Check aria-hidden="true" />
				) : (
					<Copy aria-hidden="true" />
				)}
				{copyState === "copied" ? "Copied" : "Copy roast"}
			</button>
			<button type="button" onClick={shareRoast}>
				<Share2 aria-hidden="true" /> Share
			</button>
			<span aria-live="polite">
				{copyState === "failed" ? "Could not copy. Copy the URL instead." : ""}
			</span>
		</div>
	);
}
