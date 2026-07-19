import type { ReactNode } from "react";

type AppPageHeaderProps = {
	action?: ReactNode;
	description?: string;
	title: string;
};

export function AppPageHeader({
	action,
	description,
	title,
}: AppPageHeaderProps) {
	return (
		<header className="mb-7">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-[-0.025em] text-ink">
						{title}
					</h1>
					{description ? (
						<p className="mt-1 text-sm text-muted">{description}</p>
					) : null}
				</div>
				{action}
			</div>
		</header>
	);
}
