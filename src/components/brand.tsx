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

export function FlintMark({ className = "" }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 34 34"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path className="brand__flake" d="M4 26 13 4l14 8-7 18-8-4-5 4Z" />
			<path className="brand__facet" d="m13 4 1 15 13-7-7 18-8-4-5 4Z" />
			<circle className="brand__spark" cx="29" cy="7" r="2.5" />
		</svg>
	);
}

export function Logo({ className = "" }: { className?: string }) {
	return (
		<span className={`brand ${className}`.trim()}>
			<FlintMark className="brand__mark" />
			<span className="brand__wordmark">flint</span>
		</span>
	);
}

export function DotMatrixSpark({ className = "" }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={`dot-matrix ${className}`.trim()}
			viewBox="0 0 368 152"
			xmlns="http://www.w3.org/2000/svg"
		>
			{faintDots.map(([cx, cy, r]) => (
				<circle
					className="dot-matrix__faint"
					cx={cx}
					cy={cy}
					key={`${cx}-${cy}`}
					r={r}
				/>
			))}
			<path
				className="dot-matrix__flake"
				d="m154 122 31-78 40 23-20 56-25-13-15 12Z"
			/>
			{sparkDots.map(([cx, cy, r]) => (
				<circle
					className="dot-matrix__spark"
					cx={cx}
					cy={cy}
					key={`${cx}-${cy}`}
					r={r}
				/>
			))}
		</svg>
	);
}
