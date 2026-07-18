import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { DotMatrixSpark, Logo } from "./brand";

export function AuthShell({
	children,
	title,
}: {
	children?: ReactNode;
	title: string;
}) {
	return (
		<main className="auth-page">
			<Link aria-label="Flint home" className="auth-page__home" to="/">
				<Logo />
			</Link>
			<section className="auth-card">
				<aside className="auth-card__brand">
					<Logo className="brand--cream" />
					<DotMatrixSpark className="auth-card__dots" />
					<p>Catch what your agents leak.</p>
				</aside>
				<div className="auth-card__content">
					<div>
						<p className="eyebrow">Flint account</p>
						<h1>{title}</h1>
					</div>
					<div className="auth-card__body">
						{children ?? (
							<div aria-hidden="true" className="auth-card__placeholder" />
						)}
					</div>
				</div>
			</section>
		</main>
	);
}
