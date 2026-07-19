import { Link } from "@tanstack/react-router";

import { HelixMark } from "./brand";

export function Logo({ inverse = false }: { inverse?: boolean }) {
	return (
		<Link
			className={`inline-flex w-max items-center gap-2.5 ${inverse ? "text-white" : "text-ink"}`}
			aria-label="Helix home"
			to="/"
		>
			<HelixMark className="size-7 flex-none" />
			<span className="font-serif text-[25px] leading-none italic tracking-[-0.02em]">
				helix
			</span>
		</Link>
	);
}
