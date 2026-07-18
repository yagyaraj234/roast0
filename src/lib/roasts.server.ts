import { db } from "./db.server";
import {
	summarizeRoasts,
	type RoastListItem,
	type RoastMetrics,
	type RoastSource,
} from "./roasts";

const SOURCES = new Set<RoastSource>([
	"synthetic",
	"upload",
	"bfcl",
	"gaia",
	"live",
]);

function record(value: unknown): Record<string, unknown> {
	return value && typeof value === "object"
		? (value as Record<string, unknown>)
		: {};
}

function string(value: unknown, fallback = "") {
	return typeof value === "string" ? value : fallback;
}

function number(value: unknown) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function source(value: unknown): RoastSource {
	return typeof value === "string" && SOURCES.has(value as RoastSource)
		? (value as RoastSource)
		: "upload";
}

function mapListItem(value: unknown): RoastListItem | null {
	const row = record(value);
	const id = string(row.id);
	const slug = string(row.slug);
	if (!id || !slug) return null;

	return {
		id,
		slug,
		title: string(row.title, "Untitled trace"),
		source: source(row.source),
		score: number(row.score),
		tier: string(row.tier, "Unknown"),
		status: "done",
		createdAt: string(row.created_at),
	};
}

function mapMetrics(value: unknown): RoastMetrics {
	const row = record(value);
	const findings = Array.isArray(row.findings) ? row.findings : [];
	const cost = record(row.cost);

	return {
		createdAt: string(row.created_at),
		score: number(row.score),
		status: "done",
		secretCount: findings.filter(
			(finding) => record(finding).rule === "leaked-secret",
		).length,
		wasteUsd: number(cost.wasteUsd),
	};
}

export async function getDashboardData() {
	const { data, error, count } = await db
		.from("roasts")
		.select(
			"id, slug, title, source, score, tier, findings, cost, created_at",
			{ count: "exact" },
		)
		.order("created_at", { ascending: false });

	if (error) throw new Error(`Could not load roasts: ${error.message}`);

	const rows: unknown[] = data ?? [];
	const roasts = rows
		.map(mapListItem)
		.filter((row): row is RoastListItem => row !== null);

	return {
		stats: summarizeRoasts(rows.map(mapMetrics), count ?? roasts.length),
		recent: roasts.slice(0, 10),
		roasts,
	};
}
