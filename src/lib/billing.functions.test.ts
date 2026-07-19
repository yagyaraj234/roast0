// @ts-expect-error Bun provides module mocks in its test runtime.
import { mock } from "bun:test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const state = {
	getAccessToken: vi.fn(),
	getAuthenticatedUser: vi.fn(),
	getSupabaseAuthClient: vi.fn(),
	requireAccessToken: vi.fn(),
	requireAuthenticatedUser: vi.fn(),
};

vi.mock("@tanstack/react-start", () => ({
	createServerFn: ({ method = "GET" }: { method?: string } = {}) => ({
		handler(handler: () => unknown) {
			return Object.assign(handler, { method });
		},
	}),
}));

mock.module("./supabase-auth.server", () => state);
const { createBillingCheckout, getBillingStatus } = await import(
	"./billing.functions"
);
mock.restore();

const fetchMock = vi.fn();
const originalFetch = globalThis.fetch;

beforeEach(() => {
	state.requireAuthenticatedUser.mockResolvedValue({ id: "user-1" });
	state.requireAccessToken.mockResolvedValue("access-token");
	globalThis.fetch = fetchMock as typeof fetch;
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	fetchMock.mockReset();
	state.requireAccessToken.mockReset();
	state.requireAuthenticatedUser.mockReset();
});

describe("billing server functions", () => {
	test("creates an authenticated checkout and returns only its URL", async () => {
		fetchMock.mockResolvedValue(
			Response.json({
				checkout_url: "https://checkout.test/session",
				secret: "not-forwarded",
			}),
		);

		await expect(createBillingCheckout()).resolves.toBe(
			"https://checkout.test/session",
		);
		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:8000/billing/checkout",
			expect.objectContaining({
				body: "{}",
				headers: expect.objectContaining({
					authorization: "Bearer access-token",
				}),
				method: "POST",
			}),
		);
	});

	test("loads free and pro statuses without forwarding unknown fields", async () => {
		fetchMock
			.mockResolvedValueOnce(
				Response.json({
					plan: "free",
					status: "none",
					scans_used_this_month: 2,
					scans_included: 5,
					secret: "not-forwarded",
				}),
			)
			.mockResolvedValueOnce(
				Response.json({
					plan: "pro",
					status: "active",
					credits_remaining: 9,
					current_period_end: "2026-08-18T00:00:00Z",
					secret: "not-forwarded",
				}),
			);

		await expect(getBillingStatus()).resolves.toEqual({
			plan: "free",
			status: "none",
			scans_used_this_month: 2,
			scans_included: 5,
		});
		await expect(getBillingStatus()).resolves.toEqual({
			plan: "pro",
			status: "active",
			credits_remaining: 9,
			current_period_end: "2026-08-18T00:00:00Z",
		});
		expect(fetchMock).toHaveBeenLastCalledWith(
			"http://localhost:8000/billing/status",
			{ headers: { authorization: "Bearer access-token" } },
		);
	});

	test("rejects unsuccessful billing responses", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 500 }));
		await expect(getBillingStatus()).rejects.toThrow(
			"Billing request could not be completed.",
		);
	});
});
