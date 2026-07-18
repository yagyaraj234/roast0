import { describe, expect, test } from "vitest";

import {
	formatShareText,
	publicRoastMeta,
	toPublicRoast,
	toPublicRoastSummaries,
} from "./public-roasts";

describe("public roasts", () => {
	test("keeps only safe, valid wall fields", () => {
		expect(
			toPublicRoastSummaries([
				{
					slug: "hot-one",
					title: "Leaky agent",
					score: -4.2,
					tier: "Charcoal",
					roast_line: "This agent put its secrets on speakerphone.",
					created_at: "2026-07-18T00:00:00Z",
					raw_trace: "never reaches the client",
				},
				{ slug: "broken" },
			]),
		).toEqual([
			{
				slug: "hot-one",
				title: "Leaky agent",
				score: 0,
				tier: "Charcoal",
				roastLine: "This agent put its secrets on speakerphone.",
				createdAt: "2026-07-18T00:00:00Z",
			},
		]);
	});

	test("returns a redaction-safe card DTO and share metadata", () => {
		const roast = toPublicRoast({
			slug: "hot-one",
			title: "Leaky agent",
			source: "live",
			score: 12,
			tier: "Charcoal",
			roast_line: "This agent put its secrets on speakerphone.",
			findings: [
				{
					rule: "leaked-secret",
					category: "security",
					severity: 3,
					message: "Secret reached tool arguments.",
				},
			],
			cost: {
				totalTokensIn: 1000,
				totalTokensOut: 200,
				totalUsd: 1.25,
				wasteUsd: 0.5,
				tokenSource: "measured",
				monthlyProjectionUsd: 15000,
				projectionAssumption: "at 1,000 runs/day",
			},
			normalized: {
				spans: [
					{
						id: "tool-1",
						type: "tool",
						name: "send_email",
						durationMs: 42,
						input: "sk-FAKE000000000000000000000000",
						meta: { private: true },
					},
				],
			},
			raw_trace: "never public",
		});

		expect(roast).not.toBeNull();
		if (!roast) return;
		expect(roast.timeline).toEqual([
			{
				id: "tool-1",
				type: "tool",
				name: "send_email",
				model: null,
				tokensIn: null,
				tokensOut: null,
				durationMs: 42,
			},
		]);
		expect(JSON.stringify(roast)).not.toContain("sk-FAKE");
		expect(formatShareText(roast, "https://roast0.dev/r/hot-one")).toContain(
			"12/100 · Charcoal · $0.50 waste found",
		);
		expect(publicRoastMeta(roast)).toEqual({
			title: "This agent put its secrets on speakerphone. · Roast0",
			description: "12/100 · Charcoal · $0.50 waste found. Leaky agent",
		});
	});
});
