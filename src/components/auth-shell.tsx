import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "./brand";
import { monoLabel } from "./ui";

export function AuthShell({
	children,
	imageSrc = "/auth-panel.jpeg",
	title,
}: {
	children?: ReactNode;
	imageSrc?: string;
	title: string;
}) {
	return (
		<main className="grid min-h-svh place-items-center bg-surface-alt p-4 sm:p-6">
			<section className="relative grid w-full max-w-[1020px] overflow-hidden rounded-3xl border border-line bg-white shadow-[0_28px_70px_rgba(10,10,10,0.1)] md:h-[640px] md:grid-cols-[44%_56%]">
				<Link
					aria-label="Return to Helix home"
					className="absolute right-5 top-5 z-10 inline-flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-alt hover:text-ink"
					to="/"
				>
					<X aria-hidden="true" size={20} strokeWidth={1.75} />
				</Link>
				<aside className="relative hidden md:block">
					<img
						alt=""
						className="absolute inset-0 h-full w-full object-cover"
						src={imageSrc}
					/>
					<div
						aria-hidden="true"
						className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/5 to-transparent"
					/>
					<p className="absolute bottom-8 left-8 max-w-[280px] font-serif text-[34px] leading-[1.02] text-white">
						See where your agents waste money.
					</p>
				</aside>
				<div className="flex min-h-0 flex-col justify-center gap-7 overflow-y-auto p-7 sm:p-10">
					<Link aria-label="Helix home" className="w-max" to="/">
						<Logo />
					</Link>
					<div>
						<p className={`${monoLabel} text-muted`}>Helix account</p>
						<h1 className="mt-2.5 text-3xl font-semibold tracking-[-0.03em] text-ink">
							{title}
						</h1>
					</div>
					<div>{children}</div>
				</div>
			</section>
		</main>
	);
}
