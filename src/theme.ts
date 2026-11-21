import type React from 'react';
import type {CaptionTheme, SafeArea} from './types';

export const defaultTheme: Required<
	Pick<
		CaptionTheme,
		| 'fontFamily'
		| 'fontSize'
		| 'textColor'
		| 'activeColor'
		| 'pillColor'
		| 'position'
		| 'edgeOffset'
		| 'paddingX'
		| 'maxWidth'
	>
> = {
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
	fontSize: 72,
	textColor: '#ffffff',
	activeColor: '#4ade80',
	pillColor: '#ececee',
	position: 'bottom',
	edgeOffset: 0.1,
	paddingX: 0.06,
	maxWidth: 1,
};

/**
 * Where each platform's interface sits over a vertical video, as fractions
 * of the frame: the band of buttons and text at the bottom, the tabs at the
 * top, the rail of buttons down the right (cleared on both sides, so the
 * block stays centred). Published guides disagree by a few percent; these
 * sit at the cautious end of them, and "all" clears every one.
 */
export const SAFE_AREAS: Record<SafeArea, {top: number; bottom: number; side: number}> = {
	tiktok: {top: 0.1, bottom: 0.2, side: 0.12},
	reels: {top: 0.1, bottom: 0.2, side: 0.1},
	shorts: {top: 0.1, bottom: 0.17, side: 0.14},
	all: {top: 0.12, bottom: 0.25, side: 0.14},
};

export const resolveTheme = (theme?: CaptionTheme) => {
	const set = Object.fromEntries(
		Object.entries(theme ?? {}).filter(([, v]) => v !== undefined),
	) as CaptionTheme;
	const position = set.position ?? defaultTheme.position;
	const safe = set.safeArea ? SAFE_AREAS[set.safeArea] : undefined;
	return {
		...defaultTheme,
		...set,
		edgeOffset:
			set.edgeOffset ??
			(position === 'center' ? 0 : safe ? safe[position] : defaultTheme.edgeOffset),
		paddingX: set.paddingX ?? safe?.side ?? defaultTheme.paddingX,
	};
};

export type ResolvedTheme = ReturnType<typeof resolveTheme>;

/**
 * AbsoluteFill style that places a caption block per the theme's position.
 * Text shadows/strokes are the preset's job; placement is shared.
 *
 * The offset is the block's top or bottom edge, which measures the
 * container's height, so it is a fraction of the height wherever the track
 * sits. Before 1.0 it was padding, which measures the width: 0.18 on a
 * 1080x1920 frame left 194px instead of 346.
 */
export const placementStyle = (theme: ResolvedTheme): React.CSSProperties => {
	const inset = `${Math.max(theme.paddingX, (1 - theme.maxWidth) / 2) * 100}%`;
	const offset = `${theme.edgeOffset * 100}%`;
	return {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent:
			theme.position === 'top'
				? 'flex-start'
				: theme.position === 'center'
					? 'center'
					: 'flex-end',
		// AbsoluteFill fixes the height; the edges set it instead.
		height: 'auto',
		top: theme.position === 'top' ? offset : 0,
		// Lifting a centred block by d means taking 2d off the bottom.
		bottom:
			theme.position === 'bottom'
				? offset
				: theme.position === 'center'
					? `${theme.edgeOffset * 200}%`
					: 0,
		paddingLeft: inset,
		paddingRight: inset,
	};
};

/**
 * Weight, case and outline from the theme, over the preset's own. The
 * outline is drawn at twice the width with paint-order putting it behind
 * the fill, so the full width shows outside the letters and none of it
 * thins them.
 */
export const typeStyle = (
	theme: ResolvedTheme,
	preset: {fontWeight: number; uppercase?: boolean; strokeWidth?: number},
): React.CSSProperties => {
	const stroke = theme.strokeWidth ?? preset.strokeWidth ?? 0;
	return {
		fontWeight: theme.fontWeight ?? preset.fontWeight,
		textTransform: theme.uppercase ?? preset.uppercase ? 'uppercase' : undefined,
		...(stroke > 0
			? {
					WebkitTextStroke: `${stroke * 2}px ${theme.strokeColor ?? '#000000'}`,
					paintOrder: 'stroke fill',
				}
			: {}),
	};
};
