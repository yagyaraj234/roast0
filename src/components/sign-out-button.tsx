import { useState } from "react";
import { logOut } from "#/lib/auth.functions";
import { secondaryButton } from "./ui";

export function SignOutButton() {
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function handleSignOut() {
		setPending(true);
		setError(null);
		try {
			const result = await logOut();
			if (!result.ok) {
				setError(result.error);
				return;
			}
			window.location.assign("/login");
		} catch {
			setError("Could not sign out. Try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<div>
			<button
				className={secondaryButton}
				disabled={pending}
				onClick={handleSignOut}
				type="button"
			>
				{pending ? "Signing out…" : "Sign out"}
			</button>
			{error ? (
				<p className="mt-1.5 text-sm text-danger" role="alert">
					{error}
				</p>
			) : null}
		</div>
	);
}
