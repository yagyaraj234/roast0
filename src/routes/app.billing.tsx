import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppPageHeader } from "#/components/app-page-header";
import { primaryButton } from "#/components/ui";
import {
	type BillingStatus,
	createBillingCheckout,
	getBillingStatus,
} from "#/lib/billing.functions";

export const Route = createFileRoute("/app/billing")({
	component: BillingPage,
});

export function BillingPage() {
	const [billing, setBilling] = useState<BillingStatus | null>(null);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const [upgrading, setUpgrading] = useState(false);

	useEffect(() => {
		void getBillingStatus()
			.then(setBilling)
			.catch(() => setError("Could not load billing."))
			.finally(() => setLoading(false));
	}, []);

	async function upgrade() {
		setError("");
		setUpgrading(true);
		try {
			window.location.assign(await createBillingCheckout());
		} catch {
			setError("Could not start checkout.");
			setUpgrading(false);
		}
	}

	return (
		<main>
			<AppPageHeader
				title="Billing"
				description="Manage your plan and monthly usage."
			/>
			{error ? (
				<p className="mt-6 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}
			{loading ? (
				<p className="mt-7 text-sm text-muted">Loading billing…</p>
			) : null}
			{billing ? (
				<section
					aria-label="Billing plan"
					className="mt-7 max-w-xl rounded-xl border border-line bg-white p-5 sm:p-7"
				>
					<p className="text-sm text-muted">Current plan</p>
					<h2 className="mt-1 text-2xl font-semibold capitalize text-ink">
						{billing.plan}
					</h2>
					{billing.plan === "free" ? (
						<>
							<p className="mt-5 text-sm text-neutral-600">
								<span className="font-mono text-lg font-semibold text-ink">
									{billing.scans_used_this_month} / {billing.scans_included}
								</span>{" "}
								scans used this month
							</p>
							<button
								className={`${primaryButton} mt-6`}
								disabled={upgrading}
								onClick={() => void upgrade()}
								type="button"
							>
								{upgrading ? "Opening checkout…" : "Upgrade to Pro"}
							</button>
						</>
					) : (
						<div className="mt-5 grid gap-2 text-sm text-neutral-600">
							<p>
								<span className="font-mono text-lg font-semibold text-ink">
									{billing.credits_remaining ?? "—"}
								</span>{" "}
								credits remaining
							</p>
							<p>
								Current period ends {formatDate(billing.current_period_end)}
							</p>
						</div>
					)}
				</section>
			) : null}
		</main>
	);
}

function formatDate(value?: string) {
	if (!value) return "—";
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "—"
		: new Intl.DateTimeFormat("en", {
				dateStyle: "medium",
			}).format(date);
}
