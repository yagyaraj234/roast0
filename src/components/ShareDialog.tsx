import { type FormEvent, useEffect, useRef, useState } from "react";
import type { SharingPayload, SharingVisibility } from "../lib/shares";
import {
	addRoastShare,
	getRoastSharing,
	removeRoastShare,
	updateRoastVisibility,
} from "../lib/shares.functions";
import { monoLabel, secondaryButton } from "./ui";

function errorMessage(error: unknown): string {
	return error instanceof Error
		? error.message
		: "Sharing request could not be completed.";
}

export function ShareDialog({
	slug,
	isOwner,
}: {
	slug: string;
	isOwner: boolean;
}) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
	const [sharing, setSharing] = useState<SharingPayload | null>(null);
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [pending, setPending] = useState(false);
	const [copied, setCopied] = useState(false);
	const [closing, setClosing] = useState(false);
	const [reportUrl, setReportUrl] = useState("");

	useEffect(
		() => () => {
			clearTimeout(closeTimer.current);
			clearTimeout(copyTimer.current);
		},
		[],
	);

	if (!isOwner) return null;

	async function apply(
		action: () => Promise<SharingPayload>,
	): Promise<boolean> {
		setError("");
		setPending(true);
		try {
			setSharing(await action());
			return true;
		} catch (actionError) {
			setError(errorMessage(actionError));
			return false;
		} finally {
			setPending(false);
		}
	}

	async function openDialog(): Promise<void> {
		setClosing(false);
		setSharing(null);
		setReportUrl(window.location.href);
		dialogRef.current?.showModal();
		await apply(() => getRoastSharing({ data: slug }));
	}

	function closeDialog(): void {
		if (!dialogRef.current?.open) return;
		setClosing(true);
		clearTimeout(closeTimer.current);
		closeTimer.current = setTimeout(() => {
			dialogRef.current?.close();
			setClosing(false);
		}, 140);
	}

	async function changeVisibility(
		visibility: SharingVisibility,
	): Promise<void> {
		await apply(() => updateRoastVisibility({ data: { slug, visibility } }));
	}

	async function addEmail(event: FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault();
		if (await apply(() => addRoastShare({ data: { slug, email } }))) {
			setEmail("");
		}
	}

	async function removeEmail(shareEmail: string): Promise<void> {
		await apply(() => removeRoastShare({ data: { slug, email: shareEmail } }));
	}

	async function copyLink(): Promise<void> {
		try {
			await navigator.clipboard.writeText(reportUrl);
			setCopied(true);
			clearTimeout(copyTimer.current);
			copyTimer.current = setTimeout(() => setCopied(false), 1500);
		} catch (copyError) {
			setError(errorMessage(copyError));
		}
	}

	return (
		<>
			<button
				className={`${secondaryButton} mt-4 px-3.5 py-2 text-xs`}
				type="button"
				onClick={openDialog}
			>
				Share report
			</button>
			<dialog
				aria-labelledby="share-dialog-title"
				className="m-auto max-h-[min(720px,calc(100vh-32px))] w-[min(520px,calc(100%-32px))] overflow-auto rounded-xl border border-line bg-white p-0 text-ink shadow-[0_28px_80px_rgba(10,10,10,0.22)] backdrop:bg-black/50 open:animate-dialog-in data-[closing=true]:animate-dialog-out"
				data-closing={closing || undefined}
				onCancel={(event) => {
					event.preventDefault();
					closeDialog();
				}}
				ref={dialogRef}
			>
				<header className="flex items-start justify-between gap-6 border-b border-line px-6 pt-6 pb-5">
					<div>
						<p className={`${monoLabel} text-muted`}>Report access</p>
						<h2
							className="mt-1.5 text-2xl font-semibold tracking-[-0.02em]"
							id="share-dialog-title"
						>
							Share report
						</h2>
					</div>
					<button
						aria-label="Close sharing dialog"
						className="grid size-8 flex-none place-items-center rounded-md border border-line bg-white text-lg text-muted transition duration-150 ease-out hover:bg-surface-alt active:scale-[0.97]"
						type="button"
						onClick={closeDialog}
					>
						×
					</button>
				</header>

				{sharing ? (
					<>
						<section
							className="px-6 py-5.5"
							aria-labelledby="link-access-heading"
						>
							<h3
								className="mb-3.5 text-sm font-semibold"
								id="link-access-heading"
							>
								Link access
							</h3>
							<fieldset className="relative grid grid-cols-2 rounded-lg border border-line bg-surface-alt p-1">
								<legend className="sr-only">Link visibility</legend>
								{(["public", "private"] as const).map((visibility) => (
									<button
										aria-pressed={sharing.visibility === visibility}
										className={`min-h-9 rounded-md text-xs font-semibold transition duration-150 ease-out active:scale-[0.97] disabled:opacity-50 ${
											sharing.visibility === visibility
												? "bg-white text-ink shadow-[0_1px_4px_rgba(10,10,10,0.09)]"
												: "text-muted"
										}`}
										disabled={pending}
										key={visibility}
										type="button"
										onClick={() => changeVisibility(visibility)}
									>
										{visibility === "public" ? "Public" : "Private"}
									</button>
								))}
							</fieldset>
							<div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
								<input
									aria-label="Report URL"
									className="h-10 min-w-0 rounded-md border border-line bg-white px-3 font-mono text-[11px] text-muted"
									readOnly
									value={reportUrl}
								/>
								<button
									className="min-w-16 rounded-md bg-ink px-3.5 text-xs font-semibold text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.97] disabled:opacity-50"
									disabled={pending}
									type="button"
									onClick={copyLink}
								>
									{copied ? "Copied" : "Copy"}
								</button>
							</div>
							{sharing.visibility === "private" && (
								<p className="mt-3.5 text-xs text-muted">
									Recipients must sign in with an email listed below.
								</p>
							)}
						</section>

						<section
							className="border-t border-line px-6 py-5.5"
							aria-labelledby="people-access-heading"
						>
							<h3
								className="mb-3.5 text-sm font-semibold"
								id="people-access-heading"
							>
								People with access
							</h3>
							<form onSubmit={addEmail}>
								<label className="text-[11px] text-muted" htmlFor="share-email">
									Email address
								</label>
								<div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
									<input
										autoComplete="email"
										className="h-10 min-w-0 rounded-md border border-line bg-white px-3 text-xs text-ink"
										disabled={pending}
										id="share-email"
										placeholder="person@company.com"
										required
										type="email"
										value={email}
										onChange={(event) => setEmail(event.target.value)}
									/>
									<button
										className="min-w-16 rounded-md bg-ink px-3.5 text-xs font-semibold text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.97] disabled:opacity-50"
										disabled={pending}
										type="submit"
									>
										Add
									</button>
								</div>
							</form>
							{sharing.shares.length > 0 ? (
								<ul className="mt-4 border-t border-line">
									{sharing.shares.map((share) => (
										<li
											className="flex items-center justify-between gap-4 border-b border-line py-2.5 text-xs"
											key={share.email}
										>
											<span>{share.email}</span>
											<button
												aria-label={`Remove ${share.email}`}
												className="grid size-7 place-items-center rounded-md border border-line bg-white text-base text-muted transition duration-150 ease-out hover:bg-surface-alt active:scale-[0.97] disabled:opacity-50"
												disabled={pending}
												type="button"
												onClick={() => removeEmail(share.email)}
											>
												×
											</button>
										</li>
									))}
								</ul>
							) : (
								<p className="mt-3.5 text-xs text-muted">No people added.</p>
							)}
						</section>
					</>
				) : (
					<p className="px-6 py-7 text-xs text-muted">
						Loading sharing settings…
					</p>
				)}

				{error && (
					<p
						className="border-t border-line px-6 py-3 text-xs text-danger"
						role="alert"
					>
						{error}
					</p>
				)}
			</dialog>
		</>
	);
}
