const faintDots = [
	[24, 100, 2],
	[54, 68, 2],
	[88, 118, 2],
	[119, 48, 2],
	[151, 94, 2],
	[185, 38, 2],
	[220, 92, 2],
	[252, 48, 2],
	[288, 106, 2],
	[324, 66, 2],
] as const;

const sparkDots = [
	[148, 98, 3],
	[167, 80, 4],
	[187, 103, 3],
	[204, 66, 4],
	[222, 90, 3],
	[240, 44, 3],
	[260, 78, 4],
	[282, 28, 3],
] as const;

export function HelixMark({ className = "" }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 64 64"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M5 13 28 23 24 41 5 51 12 32Z" fill="currentColor" />
			<path d="M59 13 36 23 40 41 59 51 52 32Z" fill="currentColor" />
			<rect x="29" y="18" width="6" height="28" rx="3" fill="#4a7fd6" />
		</svg>
	);
}

export function Logo({ className = "" }: { className?: string }) {
	return (
		<span
			className={`inline-flex items-center gap-2.5 text-ink ${className}`.trim()}
		>
			<HelixMark className="size-7 flex-none" />
			<span className="font-serif text-[25px] leading-none italic tracking-[-0.02em]">
				helix
			</span>
		</span>
	);
}

export function DotMatrixSpark({ className = "" }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 368 152"
			xmlns="http://www.w3.org/2000/svg"
		>
			{faintDots.map(([cx, cy, r]) => (
				<circle
					cx={cx}
					cy={cy}
					fill="#a8a29e"
					key={`${cx}-${cy}`}
					opacity="0.32"
					r={r}
				/>
			))}
			<path d="m154 122 31-78 40 23-20 56-25-13-15 12Z" fill="#4a7fd6" />
			{sparkDots.map(([cx, cy, r]) => (
				<circle cx={cx} cy={cy} fill="#e4eafc" key={`${cx}-${cy}`} r={r} />
			))}
		</svg>
	);
}
