import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileJson, Upload } from "lucide-react";
import { type FormEvent, useState } from "react";

import { AppPageHeader } from "#/components/app-page-header";
import { fieldClass, primaryButton } from "#/components/ui";
import { createUpload } from "#/lib/roast-functions";

export { createUpload } from "#/lib/roast-functions";

export const Route = createFileRoute("/app/new")({ component: NewRoast });

function NewRoast() {
	const navigate = useNavigate();
	const [tab, setTab] = useState<"paste" | "upload">("paste");
	const [title, setTitle] = useState("");
	const [text, setText] = useState("");
	const [fileName, setFileName] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	async function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSubmitting(true);
		setError("");
		try {
			const result = await createUpload({ data: { text, title } });
			await navigate({
				to: "/app/roasts/$batch",
				params: { batch: result.batch_id },
			});
		} catch (submissionError) {
			setError(
				submissionError instanceof Error
					? submissionError.message
					: "Could not upload traces.",
			);
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main>
			<AppPageHeader
				description="Single object, array, or JSONL. Maximum 20 traces per upload."
				title="Scan traces"
			/>

			<form
				onSubmit={submit}
				className="mt-7 rounded-xl border border-line bg-white p-5 sm:p-7"
			>
				<label className="block text-sm font-medium text-ink" htmlFor="title">
					Title <span className="font-normal text-neutral-400">optional</span>
				</label>
				<input
					id="title"
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					maxLength={120}
					placeholder="Production support agent"
					className={`${fieldClass} mt-2`}
				/>

				<div
					className="mt-6 flex gap-1 border-b border-line"
					role="tablist"
					aria-label="Trace input method"
				>
					<Tab active={tab === "paste"} onClick={() => setTab("paste")}>
						Paste JSON
					</Tab>
					<Tab active={tab === "upload"} onClick={() => setTab("upload")}>
						Upload file
					</Tab>
				</div>

				{tab === "paste" ? (
					<div className="mt-4" role="tabpanel">
						<label className="sr-only" htmlFor="trace-json">
							Trace JSON or JSONL
						</label>
						<textarea
							id="trace-json"
							value={text}
							onChange={(event) => setText(event.target.value)}
							rows={13}
							spellCheck={false}
							placeholder={'{"spans":[...]}'}
							className="w-full resize-y rounded-lg border border-ink bg-ink p-4 font-mono text-sm text-neutral-100 outline-none transition duration-150 placeholder:text-neutral-500 focus:border-accent focus:ring-4 focus:ring-accent/20"
						/>
					</div>
				) : (
					<label
						className="mt-4 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-paper text-center transition-colors duration-150 hover:border-accent"
						role="tabpanel"
					>
						<Upload className="text-accent" aria-hidden="true" />
						<span className="mt-3 text-sm font-medium text-ink">
							{fileName || "Choose JSON or JSONL file"}
						</span>
						<span className="mt-1 text-xs text-muted">
							Source and format detected automatically.
						</span>
						<input
							type="file"
							accept=".json,.jsonl,application/json,application/x-ndjson"
							className="sr-only"
							onChange={async (event) => {
								const file = event.target.files?.[0];
								if (!file) return;
								setFileName(file.name);
								setText(await file.text());
							}}
						/>
					</label>
				)}

				{error && (
					<p className="mt-4 text-sm text-danger" role="alert">
						{error}
					</p>
				)}
				<div className="mt-5 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-xs text-muted">
						Helix redacts supported secrets before any row is stored.
					</p>
					<button
						type="submit"
						disabled={submitting}
						className={`${primaryButton} w-full disabled:cursor-wait sm:w-auto`}
					>
						<FileJson size={16} aria-hidden="true" />
						{submitting ? "Staging…" : "Scan traces"}
					</button>
				</div>
			</form>
		</main>
	);
}

function Tab({
	active,
	onClick,
	children,
}: {
	active: boolean;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			onClick={onClick}
			className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"}`}
		>
			{children}
		</button>
	);
}
