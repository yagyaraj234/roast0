export function DotMatrix() {
	return (
		<svg
			className="dot-matrix"
			viewBox="0 0 720 620"
			aria-hidden="true"
			preserveAspectRatio="xMidYMid meet"
		>
			<defs>
				<pattern
					id="dot-field"
					width="24"
					height="24"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="3" cy="3" r="2.15" fill="currentColor" />
				</pattern>
				<pattern
					id="dot-ember"
					width="24"
					height="24"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="3" cy="3" r="3" fill="#ff5310" />
				</pattern>
				<pattern
					id="dot-soft"
					width="24"
					height="24"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="3" cy="3" r="3.5" fill="#ff9b62" />
				</pattern>
				<pattern
					id="dot-white"
					width="24"
					height="24"
					patternUnits="userSpaceOnUse"
				>
					<circle cx="3" cy="3" r="4" fill="#fff4e8" />
				</pattern>
				<radialGradient id="field-fade" cx="62%" cy="52%" r="56%">
					<stop offset="0" stopColor="white" />
					<stop offset="0.64" stopColor="white" stopOpacity=".55" />
					<stop offset="1" stopColor="white" stopOpacity="0" />
				</radialGradient>
				<mask id="field-mask">
					<rect width="720" height="620" fill="url(#field-fade)" />
				</mask>
			</defs>

			<rect
				className="dot-matrix__field"
				width="720"
				height="620"
				fill="url(#dot-field)"
				mask="url(#field-mask)"
			/>
			<g className="dot-matrix__flame" fill="url(#dot-ember)">
				<path d="M365 565c-116 0-202-73-202-184 0-78 43-133 93-186-4 64 17 94 45 109 0-96 72-169 147-242-12 89 44 128 74 185 24 45 36 91 27 142-17 101-88 176-184 176Z" />
			</g>
			<g className="dot-matrix__core" fill="url(#dot-soft)">
				<path d="M374 540c-63 0-111-42-111-105 0-48 31-85 63-116-1 42 18 62 36 74 10-62 54-103 92-142-4 58 34 83 47 124 28 88-34 165-127 165Z" />
			</g>
			<path
				className="dot-matrix__white"
				d="M370 510c-34 0-62-23-62-57 0-29 18-51 41-70 0 28 13 40 27 47 9-34 31-56 53-78-3 37 23 55 23 88 0 40-34 70-82 70Z"
				fill="url(#dot-white)"
			/>
		</svg>
	);
}

export function DotGlyph() {
	return (
		<svg className="dot-glyph" viewBox="0 0 40 40" aria-hidden="true">
			<circle cx="8" cy="30" r="3" />
			<circle cx="17" cy="27" r="4" />
			<circle cx="27" cy="29" r="2.5" />
			<circle cx="13" cy="17" r="2.5" />
			<circle cx="23" cy="16" r="3.5" />
			<circle cx="30" cy="11" r="2" />
			<circle cx="20" cy="6" r="2.5" />
		</svg>
	);
}
