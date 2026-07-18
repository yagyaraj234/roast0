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
		<header className="app-page__header">
			<div className="app-page__title-row">
				<div>
					<h1>{title}</h1>
					{description ? (
						<p className="app-page__description">{description}</p>
					) : null}
				</div>
				{action}
			</div>
		</header>
	);
}
