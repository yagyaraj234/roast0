/**
 * Shared Tailwind class compositions. One accent, ink primaries, hairline
 * borders — per DESIGN.md.
 */
export const primaryButton =
	"inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition duration-150 ease-out hover:bg-neutral-800 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

export const secondaryButton =
	"inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition duration-150 ease-out hover:border-neutral-300 hover:bg-surface-alt active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50";

export const fieldClass =
	"w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition duration-150 placeholder:text-neutral-400 focus:border-accent focus:ring-4 focus:ring-accent/10";

export const monoLabel =
	"font-mono text-[10px] font-medium uppercase tracking-[0.14em]";

export const accentLink =
	"text-accent transition-colors duration-150 hover:text-blue-700";
