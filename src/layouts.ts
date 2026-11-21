import type {PresetLayout} from './measure';

/**
 * How each preset sets its words. Its own file so the presets can read
 * theirs for auto-shrink without importing the registry that imports them.
 */
export const LAYOUTS = {
	KaraokeFill: {fontWeight: 800},
	KineticSlam: {fontWeight: 900, uppercase: true},
	PillKaraoke: {fontWeight: 800, chromeEm: 1.1},
	WeightShift: {fontWeight: 600},
	NeonGlow: {fontWeight: 800},
	EditorialEmphasis: {fontWeight: 600, fontScale: 0.92},
	PopHighlight: {fontWeight: 900, uppercase: true},
	HighlightBox: {fontWeight: 800, uppercase: true, chromeEm: 0.36},
	Bounce: {fontWeight: 900, uppercase: true},
	OneWord: {fontWeight: 900, uppercase: true, fontScale: 1.4},
	PopIn: {fontWeight: 700},
} satisfies Record<string, PresetLayout>;
