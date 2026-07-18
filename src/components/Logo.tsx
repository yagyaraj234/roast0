export function Logo({ inverse = false }: { inverse?: boolean }) {
	return (
		<a
			className={`brand${inverse ? " brand--inverse" : ""}`}
			href="/"
			aria-label="Roast0 home"
		>
			<svg
				className="brand__mark"
				viewBox="0 0 32 32"
				role="img"
				aria-label="Five-dot flame"
			>
				<circle cx="10" cy="23" r="5" fill="#ff4d00" />
				<circle cx="20" cy="21" r="4" fill="#ff6421" />
				<circle cx="13" cy="13" r="3.5" fill="#ff7b42" />
				<circle cx="22" cy="11" r="2.7" fill="#ff9564" />
				<circle cx="19" cy="4.5" r="2" fill="#ffb078" />
			</svg>
			<span className="brand__wordmark">Roast0</span>
		</a>
	);
}
