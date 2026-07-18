import { Link, Outlet } from "@tanstack/react-router";
import { createContext, useContext, useState } from "react";

import { Logo } from "./brand";
import { SignOutButton } from "./sign-out-button";

const SearchContext = createContext("");

const navItems = [
	{ label: "Dashboard", to: "/app" },
	{ label: "New roast", to: "/app/new" },
	{ label: "Roasts", to: "/app/roasts" },
	{ label: "Settings", to: "/app/settings" },
] as const;

export function useAppSearch() {
	return useContext(SearchContext);
}

export function AppShell({
	totalRoasts,
	user,
}: {
	totalRoasts: number;
	user: { email: string };
}) {
	const [search, setSearch] = useState("");
	const initial = user.email.slice(0, 1).toUpperCase() || "R";

	return (
		<SearchContext.Provider value={search}>
			<div className="app-shell">
				<aside className="app-sidebar">
					<Link aria-label="Roast0 home" className="app-sidebar__brand" to="/">
						<Logo />
					</Link>
					<nav aria-label="App navigation" className="app-sidebar__nav">
						{navItems.map((item) => (
							<Link
								activeOptions={{ exact: item.to === "/app" }}
								activeProps={{ className: "is-active" }}
								key={item.to}
								to={item.to}
							>
								{item.label}
								{item.to === "/app/roasts" ? (
									<span className="nav-count">{totalRoasts}</span>
								) : null}
							</Link>
						))}
					</nav>
					<div className="app-sidebar__footer">
						<div className="ingest-status">
							<span>Ingest</span>
							<span className="status-pill">Idle</span>
						</div>
						<div className="account-row">
							<span aria-hidden="true" className="avatar">
								{initial}
							</span>
							<span className="account-email" title={user.email}>
								{user.email}
							</span>
							<SignOutButton />
						</div>
					</div>
				</aside>
				<div className="app-column">
					<header className="app-topbar">
						<label className="search-field">
							<span className="sr-only">Search roasts by title</span>
							<input
								onChange={(event) => setSearch(event.target.value)}
								placeholder="Search roasts"
								type="search"
								value={search}
							/>
						</label>
						<span aria-hidden="true" className="avatar">
							{initial}
						</span>
					</header>
					<main className="app-content">
						<Outlet />
					</main>
				</div>
			</div>
		</SearchContext.Provider>
	);
}

export function AppPage({
	breadcrumb,
	title,
}: {
	breadcrumb: string;
	title: string;
}) {
	return (
		<div className="app-page">
			<header className="app-page__header">
				<p>{breadcrumb}</p>
				<h1>{title}</h1>
			</header>
			<section
				aria-label={`${title} content`}
				className="app-page__placeholder"
			/>
		</div>
	);
}
