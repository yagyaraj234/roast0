import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { SignOutButton } from "#/components/sign-out-button";

const appRoute = getRouteApi("/app");

export const Route = createFileRoute("/app/settings")({
	component: SettingsPage,
});

function SettingsPage() {
	const { user } = appRoute.useRouteContext();

	return (
		<div className="app-page">
			<header className="app-page__header">
				<p>Roast0 / Settings</p>
				<h1>Settings</h1>
			</header>
			<section className="max-w-xl rounded-xl border border-stone-200 bg-white p-6">
				<p className="text-xs font-medium uppercase tracking-wider text-stone-400">
					Account
				</p>
				<p className="mt-3 text-sm text-stone-500">Signed in as</p>
				<p className="mt-1 font-medium text-stone-950">{user.email}</p>
				<div className="mt-6 border-t border-stone-200 pt-6">
					<SignOutButton />
				</div>
			</section>
		</div>
	);
}
