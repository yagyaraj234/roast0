import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { AppPageHeader } from "#/components/app-page-header";
import { SignOutButton } from "#/components/sign-out-button";
import { monoLabel } from "#/components/ui";

const appRoute = getRouteApi("/app");

export const Route = createFileRoute("/app/profile")({
	component: ProfilePage,
});

function ProfilePage() {
	const { user } = appRoute.useRouteContext();
	const initial = user.email.slice(0, 1).toUpperCase() || "R";

	return (
		<div className="max-w-2xl">
			<AppPageHeader title="Profile" />
			<section
				aria-label="Account"
				className="flex flex-wrap items-center gap-4 border-y border-line py-5"
			>
				<span
					aria-hidden="true"
					className="grid size-11 flex-none place-items-center rounded-full bg-ink font-mono text-sm text-white"
				>
					{initial}
				</span>
				<div className="mr-auto min-w-0">
					<p className={`${monoLabel} text-muted`}>Account</p>
					<h2 className="mt-1 text-base font-semibold break-anywhere text-ink">
						{user.email}
					</h2>
				</div>
				<SignOutButton />
			</section>
		</div>
	);
}
