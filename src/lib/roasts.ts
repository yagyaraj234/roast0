import type { OwnerRoastRow, Source } from "./api";

export type RoastSource =
	| "synthetic"
	| "upload"
	| "bfcl"
	| "gaia"
	| "live"
	| "langsmith";

export type RoastStatus = "processing" | "done" | "failed";

export interface RoastListItem {
	id: string;
	slug: string;
	title: string;
	source: RoastSource;
	score: number;
	tier: string;
	findingCounts?: FindingCounts;
	status: RoastStatus;
	createdAt: string;
}

export interface FindingCounts {
	critical: number;
	warning: number;
	notice: number;
}

export type RoastSort =
	| "title"
	| "source"
	| "score"
	| "findings"
	| "status"
	| "createdAt";

export type SortDirection = "asc" | "desc";

export interface RoastFilters {
	source: RoastSource | "all";
	status: RoastStatus | "all";
}

export interface RoastMetrics {
	createdAt: string;
	score: number;
	status: RoastStatus;
	secretCount: number;
	wasteUsd: number;
}

export interface DashboardStats {
	totalRoasts: number;
	secretsCaught: number;
	wasteUsd: number;
	worstScoreThisWeek: number | null;
}

export interface BatchRoast {
	id: string;
	slug: string;
	title: string;
	status: RoastStatus;
	score: number;
	tier: string;
	findingCounts?: FindingCounts;
	error: string | null;
}

export interface RoastDetail extends RoastListItem {
	roastLine: string | null;
	findings: Array<{
		id: string;
		rule: string;
		category: string;
		severity: number;
		message: string;
	}>;
	cost: {
		totalTokensIn: number;
		totalTokensOut: number;
		totalUsd: number;
		wasteUsd: number;
		tokenSource: string;
		monthlyProjectionUsd: number;
		projectionAssumption: string;
	};
}

export function summarizeRoasts(
	rows: RoastMetrics[],
	totalRoasts: number,
	nowMs = Date.now(),
): DashboardStats {
	const weekAgo = nowMs - 7 * 24 * 60 * 60 * 1_000;
	const weeklyScores = rows
		.filter(
			(row) =>
				row.status === "done" && new Date(row.createdAt).getTime() >= weekAgo,
		)
		.map((row) => row.score);

	return {
		totalRoasts,
		secretsCaught: rows.reduce((sum, row) => sum + row.secretCount, 0),
		wasteUsd: rows.reduce((sum, row) => sum + row.wasteUsd, 0),
		worstScoreThisWeek:
			weeklyScores.length > 0 ? Math.min(...weeklyScores) : null,
	};
}

export function filterRoasts(rows: RoastListItem[], query: string) {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	return normalizedQuery
		? rows.filter((row) =>
				row.title.toLocaleLowerCase().includes(normalizedQuery),
			)
		: rows;
}

export function filterAndSortRoasts(
	rows: RoastListItem[],
	query: string,
	filters: RoastFilters,
	sort: RoastSort,
	direction: SortDirection,
) {
	const filtered = filterRoasts(rows, query).filter(
		(row) =>
			(filters.source === "all" || row.source === filters.source) &&
			(filters.status === "all" || row.status === filters.status),
	);
	const multiplier = direction === "asc" ? 1 : -1;

	return [...filtered].sort((left, right) => {
		const comparison = sortValue(left, sort).localeCompare(
			sortValue(right, sort),
			undefined,
			{
				numeric: true,
			},
		);
		return comparison * multiplier;
	});
}

function sortValue(row: RoastListItem, sort: RoastSort): string {
	switch (sort) {
		case "findings":
			return String(
				(row.findingCounts?.critical ?? 0) +
					(row.findingCounts?.warning ?? 0) +
					(row.findingCounts?.notice ?? 0),
			);
		case "createdAt":
			return String(new Date(row.createdAt).getTime() || 0);
		case "score":
			return String(row.score);
		case "source":
			return row.source;
		case "status":
			return row.status;
		case "title":
			return row.title;
	}
}

export function findingCounts(value: unknown): FindingCounts {
	const counts: FindingCounts = { critical: 0, warning: 0, notice: 0 };
	if (!Array.isArray(value)) return counts;

	for (const finding of value) {
		const severity =
			finding && typeof finding === "object"
				? (finding as { severity?: unknown }).severity
				: undefined;
		if (severity === 3) counts.critical += 1;
		else if (severity === 2) counts.warning += 1;
		else if (severity === 1) counts.notice += 1;
	}
	return counts;
}

function source(value: Source): RoastSource {
	return value;
}

export function mapOwnerRoastToListItem(row: OwnerRoastRow): RoastListItem {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		source: source(row.source),
		score: row.score,
		tier: row.tier,
		findingCounts: findingCounts(row.findings),
		status: row.status,
		createdAt: row.created_at,
	};
}

export function mapOwnerRoastToMetrics(row: OwnerRoastRow): RoastMetrics {
	return {
		createdAt: row.created_at,
		score: row.score,
		status: row.status,
		secretCount: row.findings.filter(
			(finding) => finding.rule === "leaked-secret",
		).length,
		wasteUsd: row.cost.waste_usd,
	};
}

export function mapOwnerRoastToBatchRoast(row: OwnerRoastRow): BatchRoast {
	return {
		id: row.id,
		slug: row.slug,
		title: row.title,
		status: row.status,
		score: row.score,
		tier: row.tier,
		findingCounts: findingCounts(row.findings),
		error: row.error,
	};
}
