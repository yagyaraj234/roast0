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
					id="dot-spark"
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
			<path
				className="dot-matrix__flake"
				d="m228 526 139-360 205 119-97 284-120-62-71 60Z"
				fill="url(#dot-spark)"
			/>
			<path
				className="dot-matrix__facet"
				d="m367 166 1 244 204-125-97 284-120-62-71 60Z"
				fill="url(#dot-soft)"
			/>
			<g className="dot-matrix__spark-burst" fill="url(#dot-white)">
				<circle cx="454" cy="144" r="12" />
				<circle cx="526" cy="92" r="8" />
				<circle cx="579" cy="166" r="6" />
				<circle cx="626" cy="62" r="5" />
			</g>
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
