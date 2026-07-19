// @ts-expect-error jsdom does not publish bundled TypeScript declarations.

// @ts-expect-error Bun provides module mocks in its test runtime; Bun types are not installed.
import { mock } from "bun:test";
import { JSDOM } from "jsdom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = {
	createBillingCheckout: vi.fn(),
	getBillingStatus: vi.fn(),
};
let useAppSearch: () => string;

function SearchProbe() {
	return <output aria-label="Current search">{useAppSearch()}</output>;
}

mock.module("#/lib/billing.functions", () => state);
vi.mock("@tanstack/react-router", () => ({
	createFileRoute: (_path: string) => (options: Record<string, unknown>) =>
		options,
	Link: ({
		activeOptions: _activeOptions,
		activeProps: _activeProps,
		children,
		to,
		...props
	}: {
		activeOptions?: unknown;
		activeProps?: unknown;
		children: React.ReactNode;
		to: string;
	}) => (
		<a href={to} {...props}>
			{children}
		</a>
	),
	Outlet: () => <SearchProbe />,
}));

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
	url: "https://helix.test/app/billing",
});
const assign = vi.fn();
const browserWindow = new Proxy(dom.window, {
	get(target, property) {
		if (property === "location") return { assign };
		return Reflect.get(target, property);
	},
});

for (const key of [
	"document",
	"navigator",
	"HTMLElement",
	"SVGElement",
	"Node",
	"Event",
	"MouseEvent",
	"MutationObserver",
] as const) {
	Object.defineProperty(globalThis, key, {
		configurable: true,
		value: dom.window[key],
	});
}
Object.defineProperty(globalThis, "window", {
	configurable: true,
	value: browserWindow,
});
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
	configurable: true,
	value: true,
	writable: true,
});

const { cleanup, fireEvent, render, waitFor } = await import(
	"@testing-library/react"
);
const appShellModule = await import("#/components/app-shell");
const { AppShell } = appShellModule;
useAppSearch = appShellModule.useAppSearch;
const { BillingPage } = await import("./app.billing");
mock.restore();

beforeEach(() => {
	assign.mockReset();
	state.createBillingCheckout.mockReset();
	state.getBillingStatus.mockReset();
});

afterEach(() => {
	cleanup();
	state.getBillingStatus.mockResolvedValue({
		plan: "free",
		status: "none",
		scans_used_this_month: 0,
		scans_included: 5,
	});
});

describe("billing page", () => {
	test("shows free usage and redirects upgrade checkout", async () => {
		state.getBillingStatus.mockResolvedValue({
			plan: "free",
			status: "none",
			scans_used_this_month: 2,
			scans_included: 5,
		});
		state.createBillingCheckout.mockResolvedValue(
			"https://checkout.test/session",
		);
		const view = render(<BillingPage />);

		await waitFor(() => expect(view.getByText("2 / 5")).toBeTruthy());
		fireEvent.click(view.getByRole("button", { name: "Upgrade to Pro" }));
		await waitFor(() =>
			expect(assign).toHaveBeenCalledWith("https://checkout.test/session"),
		);
	});

	test("shows pro credits and billing period", async () => {
		state.getBillingStatus.mockResolvedValue({
			plan: "pro",
			status: "active",
			credits_remaining: 42,
			current_period_end: "2026-08-18T00:00:00Z",
		});
		const view = render(<BillingPage />);

		await waitFor(() => expect(view.getByText("42")).toBeTruthy());
		expect(view.getByText(/Aug 18, 2026/)).toBeTruthy();
		expect(view.queryByRole("button", { name: "Upgrade to Pro" })).toBeNull();
	});

	test("reports billing load and checkout failures", async () => {
		state.getBillingStatus.mockRejectedValueOnce(new Error("offline"));
		const loadView = render(<BillingPage />);
		await waitFor(() =>
			expect(loadView.getByRole("alert").textContent).toContain(
				"Could not load billing.",
			),
		);
		loadView.unmount();

		state.getBillingStatus.mockResolvedValueOnce({
			plan: "free",
			status: "none",
			scans_used_this_month: 0,
			scans_included: 5,
		});
		state.createBillingCheckout.mockRejectedValueOnce(new Error("offline"));
		const checkoutView = render(<BillingPage />);
		await waitFor(() =>
			expect(
				checkoutView.getByRole("button", { name: "Upgrade to Pro" }).disabled,
			).toBe(false),
		);
		fireEvent.click(
			checkoutView.getByRole("button", { name: "Upgrade to Pro" }),
		);
		await waitFor(() =>
			expect(checkoutView.getByRole("alert").textContent).toContain(
				"Could not start checkout.",
			),
		);
	});
});

test("app nav shows billing link with current plan badge", async () => {
	state.getBillingStatus.mockResolvedValue({
		plan: "pro",
		status: "active",
		credits_remaining: 42,
	});
	const view = render(
		<AppShell totalRoasts={3} user={{ email: "user@example.com" }} />,
	);

	expect(view.getByRole("link", { name: /Billing/ }).getAttribute("href")).toBe(
		"/app/billing",
	);
	await waitFor(() => expect(view.getByText("Pro")).toBeTruthy());
	fireEvent.change(view.getByLabelText("Search scans by title"), {
		target: { value: "production" },
	});
	expect(view.getByLabelText("Current search").textContent).toBe("production");
});

test("keeps navigation usable when billing status is unavailable", async () => {
	state.getBillingStatus.mockRejectedValueOnce(new Error("offline"));
	render(<AppShell totalRoasts={0} user={{ email: "" }} />);
	await waitFor(() => expect(state.getBillingStatus).toHaveBeenCalledTimes(1));
});
