// @ts-expect-error Bun provides module mocks in its test runtime.
import { mock } from "bun:test";
import { afterEach, describe, expect, test } from "vitest";

const saved = {
	anon: process.env.SUPABASE_ANON_KEY,
	key: process.env.SUPABASE_PUBLISHABLE_KEY,
	url: process.env.SUPABASE_URL,
};

afterEach(() => {
	process.env.SUPABASE_ANON_KEY = saved.anon;
	process.env.SUPABASE_PUBLISHABLE_KEY = saved.key;
	process.env.SUPABASE_URL = saved.url;
});

describe("Supabase server auth configuration", () => {
	test("rejects absent server credentials", async () => {
		delete process.env.SUPABASE_URL;
		delete process.env.SUPABASE_PUBLISHABLE_KEY;
		delete process.env.SUPABASE_ANON_KEY;
		const auth = await import("./supabase-auth.server?missing-config");
		expect(() => auth.getSupabaseAuthClient()).toThrow("SUPABASE_URL");
	});

	test("uses server cookies and exposes authenticated session state", async () => {
		const calls: Array<[string, string, unknown]> = [];
		mock.module("@tanstack/react-start/server", () => ({
			getCookies: () => ({ session: "cookie" }),
			setCookie: (...args: [string, string, unknown]) => calls.push(args),
			setResponseHeader: (...args: [string, string]) =>
				calls.push([...args, undefined]),
		}));
		mock.module("@supabase/ssr", () => ({
			createServerClient: (
				_url: string,
				_key: string,
				options: {
					cookies: {
						getAll: () => unknown[];
						setAll: (
							cookies: Array<{ name: string; value: string; options: unknown }>,
							headers: Record<string, string>,
						) => void;
					};
				},
			) => {
				expect(options.cookies.getAll()).toEqual([
					{ name: "session", value: "cookie" },
				]);
				options.cookies.setAll(
					[{ name: "next", value: "value", options: {} }],
					{ Vary: "Cookie" },
				);
				return {
					auth: {
						getSession: async () => ({
							data: { session: { access_token: "token" } },
						}),
						getUser: async () => ({
							data: { user: { id: "user", email: undefined } },
						}),
					},
				};
			},
		}));
		process.env.SUPABASE_URL = "https://db.example";
		process.env.SUPABASE_PUBLISHABLE_KEY = "key";
		const auth = await import("./supabase-auth.server.ts?auth-flow");
		expect(await auth.getAuthenticatedUser()).toEqual({
			id: "user",
			email: "",
		});
		expect(await auth.requireAuthenticatedUser()).toEqual({
			id: "user",
			email: "",
		});
		expect(await auth.getAccessToken()).toBe("token");
		expect(await auth.requireAccessToken()).toBe("token");
		expect(calls).not.toHaveLength(0);
		mock.restore();
	});
});
