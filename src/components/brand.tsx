const faintDots = [
	[18, 119, 2],
	[45, 84, 2],
	[76, 131, 2],
	[102, 59, 2],
	[129, 116, 2],
	[155, 35, 2],
	[184, 92, 2],
	[211, 127, 2],
	[237, 52, 2],
	[266, 103, 2],
	[292, 24, 2],
	[320, 72, 2],
	[350, 119, 2],
] as const;

const emberDots = [
	[115, 99, 3],
	[137, 82, 3],
	[151, 106, 4],
	[169, 66, 3],
	[177, 91, 4],
	[195, 112, 4],
	[203, 76, 4],
	[218, 96, 3],
	[232, 120, 3],
	[239, 82, 3],
	[258, 103, 3],
] as const;

const hotDots = [
	[162, 123, 4],
	[181, 135, 5],
	[197, 126, 5],
	[212, 139, 5],
	[226, 129, 4],
	[190, 103, 4],
	[211, 109, 4],
	[220, 88, 3],
] as const;

export function DotFlameMark({ className = "" }: { className?: string }) {
	return (
		<svg
			aria-hidden="true"
			className={className}
			viewBox="0 0 36 44"
			xmlns="http://www.w3.org/2000/svg"
		>
			<circle className="dot-flame dot-flame--soft" cx="12" cy="34" r="6" />
			<circle className="dot-flame dot-flame--ember" cx="23" cy="35" r="5" />
			<circle className="dot-flame dot-flame--hot" cx="18" cy="23" r="4" />
			<circle className="dot-flame dot-flame--ember" cx="24" cy="14" r="3" />
			<circle className="dot-flame dot-flame--soft" cx="20" cy="6" r="2" />
		</svg>
	);
}

export function Logo({ className = "" }: { className?: string }) {
	return (
		<span className={`brand ${className}`.trim()}>
			<DotFlameMark className="brand__mark" />
			<span className="brand__wordmark">Roast0</span>
		</span>
	);
}

export function DotMatrixFlame({ className = "" }: { className?: string }) {
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
			{emberDots.map(([cx, cy, r]) => (
				<circle
					className="dot-matrix__ember"
					cx={cx}
					cy={cy}
					key={`${cx}-${cy}`}
					r={r}
				/>
			))}
			{hotDots.map(([cx, cy, r]) => (
				<circle
					className="dot-matrix__hot"
					cx={cx}
					cy={cy}
					key={`${cx}-${cy}`}
					r={r}
				/>
			))}
		</svg>
	);
}
