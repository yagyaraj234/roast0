import { FlintMark } from "./brand";

export function Logo({ inverse = false }: { inverse?: boolean }) {
	return (
		<a
			className={`brand${inverse ? " brand--inverse" : ""}`}
			href="/"
			aria-label="Flint home"
		>
			<FlintMark className="brand__mark" />
			<span className="brand__wordmark">flint</span>
		</a>
	);
}
