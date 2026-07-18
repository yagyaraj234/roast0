import type { CSSProperties } from "react";

import { fallbackRoastLine, type PublicRoast } from "../lib/public-roasts";
import { ShareButtons } from "./ShareButtons";

type ScoreStyle = CSSProperties & { "--score-target": `${number}deg` };

function money(value: number): string {
	return `$${value.toFixed(value < 10 ? 2 : 0)}`;
}

function tierSlug(tier: string): string {
	return tier.toLowerCase().replaceAll(" ", "-");
}

function spanMeta(
	tokensIn: number | null,
	tokensOut: number | null,
	durationMs: number | null,
) {
	const tokens =
		tokensIn === null && tokensOut === null
			? "tokens n/a"
			: `${(tokensIn ?? 0) + (tokensOut ?? 0)} tok`;
	const duration =
		durationMs === null
			? "duration n/a"
			: durationMs >= 1000
				? `${(durationMs / 1000).toFixed(1)}s`
				: `${durationMs}ms`;
	return `${tokens} · ${duration}`;
}

export function RoastCard({
	roast,
	preview = false,
}: {
	roast: PublicRoast;
	preview?: boolean;
}) {
	const line = roast.roastLine ?? fallbackRoastLine(roast.tier);
	const findings = preview
		? roast.findings.slice(0, 1)
		: roast.findings.slice(0, 3);
	const findingCounts = roast.findings.reduce(
		(counts, finding) => {
			if (finding.severity === 3) counts.critical += 1;
			else if (finding.severity === 2) counts.warning += 1;
			else counts.notice += 1;
			return counts;
		},
		{ critical: 0, warning: 0, notice: 0 },
	);
	const scoreStyle: ScoreStyle = {
		"--score-target": `${roast.score * 3.6}deg`,
	};

	return (
		<article className={`public-card${preview ? " public-card--preview" : ""}`}>
			<div className="public-card__topline">
				<div>
					<p className="mono-label">
						{preview ? "DEMO TRACE · LIVE CARD MARKUP" : "PUBLIC TRACE REPORT"}
					</p>
					<p className="public-card__title">{roast.title}</p>
				</div>
				<span className="source-chip">{roast.source}</span>
			</div>

			<div className="public-verdict">
				<div
					className="score-ring"
					style={scoreStyle}
					role="img"
					aria-label={`Flint score: ${roast.score} out of 100`}
				>
					<div>
						<strong>{roast.score}</strong>
						<span>/100</span>
					</div>
				</div>
				<div className="public-verdict__copy">
					<span className="tier-chip" data-tier={tierSlug(roast.tier)}>
						{roast.tier}
					</span>
					{preview ? <h2>“{line}”</h2> : <h1>“{line}”</h1>}
					<p className="mono-label">
						{findingCounts.critical} critical · {findingCounts.warning} warning
						· {findingCounts.notice} notice
					</p>
					{!preview && <ShareButtons roast={roast} />}
				</div>
			</div>

			<section
				className="public-findings"
				aria-labelledby={preview ? undefined : "findings-heading"}
			>
				<div className="card-section-heading">
					<h2 id={preview ? undefined : "findings-heading"}>Findings</h2>
					<span>{roast.findings.length} total</span>
				</div>
				{findings.length > 0 ? (
					<ol>
						{findings.map((finding) => (
							<li key={`${finding.rule}-${finding.message}`}>
								<div className="finding-tags">
									<span>SEV {finding.severity}</span>
									<span>{finding.category}</span>
								</div>
								<div>
									<strong>{finding.rule.replaceAll("-", " ")}</strong>
									<p>{finding.message}</p>
								</div>
								{finding.estWasteUsd !== null && (
									<small>{money(finding.estWasteUsd)} waste</small>
								)}
							</li>
						))}
					</ol>
				) : (
					<p className="card-empty-row">No material finding in this trace.</p>
				)}
				{!preview && roast.findings.length > 3 && (
					<p className="finding-overflow">
						+ {roast.findings.length - 3} lower-priority findings
					</p>
				)}
			</section>

			{!preview && (
				<>
					<section className="public-cost" aria-labelledby="cost-heading">
						<div className="card-section-heading">
							<h2 id="cost-heading">Cost autopsy</h2>
							<span>{roast.cost.tokenSource} usage</span>
						</div>
						<div className="cost-grid">
							<div>
								<span>Total spend</span>
								<strong>{money(roast.cost.totalUsd)}</strong>
							</div>
							<div className="cost-grid__hot">
								<span>Waste found</span>
								<strong>{money(roast.cost.wasteUsd)}</strong>
							</div>
							<div>
								<span>Monthly waste</span>
								<strong>{money(roast.cost.monthlyProjectionUsd)}</strong>
							</div>
							<div>
								<span>Tokens</span>
								<strong>
									{(
										roast.cost.totalTokensIn + roast.cost.totalTokensOut
									).toLocaleString("en-US")}
								</strong>
							</div>
						</div>
						<p>{roast.cost.projectionAssumption}</p>
					</section>

					<details className="public-timeline">
						<summary>
							<span>Trace timeline</span>
							<small>{roast.timeline.length} spans · expand</small>
						</summary>
						{roast.timeline.length > 0 ? (
							<ol>
								{roast.timeline.map((span, index) => (
									<li key={span.id}>
										<span>{String(index + 1).padStart(2, "0")}</span>
										<div>
											<strong>{span.name}</strong>
											<small>{span.model ?? span.type}</small>
										</div>
										<code>
											{spanMeta(span.tokensIn, span.tokensOut, span.durationMs)}
										</code>
									</li>
								))}
							</ol>
						) : (
							<p className="card-empty-row">No normalized spans available.</p>
						)}
					</details>
				</>
			)}
		</article>
	);
}
