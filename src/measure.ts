import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import type {ResolvedTheme} from './theme';

/** How a preset sets its words, so pages and words can be sized by measured width. */
export type PresetLayout = {
	fontWeight: number;
	uppercase?: boolean;
	/** Its type as a multiple of theme.fontSize. Default 1. */
	fontScale?: number;
	/** Width its own chrome takes beside the words, such as a pill's padding, in em. */
	chromeEm?: number;
};

/** The CSS font a theme and a preset set words in, its size in px, and whether in capitals. */
export const layoutFont = (theme: ResolvedTheme, layout: PresetLayout) => {
	const px = theme.fontSize * (layout.fontScale ?? 1);
	return {
		font: `${theme.fontWeight ?? layout.fontWeight} ${px}px ${theme.fontFamily}`,
		px,
		uppercase: Boolean(theme.uppercase ?? layout.uppercase),
	};
};

/**
 * Width a line of caption may take in a composition this wide: the block
 * the theme leaves, less the preset's chrome, with a little room for the
 * scale and outline effects that draw past a word's box.
 */
export const lineWidth = (width: number, theme: ResolvedTheme, layout: PresetLayout, px: number): number =>
	(width * (1 - 2 * Math.max(theme.paddingX, (1 - theme.maxWidth) / 2)) - (layout.chromeEm ?? 0) * px) * 0.94;

/** A canvas measuring text in one font, with each result kept. */
export const makeMeasure = (font: string, uppercase: boolean): ((text: string) => number) | undefined => {
	if (typeof document === 'undefined') {
		return undefined;
	}
	const context = document.createElement('canvas').getContext('2d');
	if (!context) {
		return undefined;
	}
	context.font = font;
	const widths = new Map<string, number>();
	return (text) => {
		const set = uppercase ? text.toUpperCase() : text;
		let width = widths.get(set);
		if (width === undefined) {
			width = context.measureText(set).width;
			widths.set(set, width);
		}
		return width;
	};
};

/**
 * Whether `font` is ready to measure `text`. Until it is, the frame is held
 * with delayRender: text measured in the fallback font would break or size
 * differently, and a render split across machines would show both. Checked
 * against the text itself, because a font served in unicode-range files
 * (Google Fonts' Chinese and Japanese families) can have the file holding
 * the space loaded and the one holding the words still on its way.
 */
export const useFontReady = (font: string | null, text: string): boolean => {
	const glyphs = text || ' ';
	const [ready, setReady] = useState(() => {
		if (!font || typeof document === 'undefined') {
			return true;
		}
		try {
			return document.fonts.check(font, glyphs);
		} catch {
			// A font string the browser can't parse: nothing to wait for, and
			// the canvas measures in whatever it falls back to.
			return true;
		}
	});
	const [handle] = useState(() => (ready ? null : delayRender(`Loading the caption font: ${font}`)));
	useEffect(() => {
		if (handle === null || !font) {
			return;
		}
		const done = () => {
			setReady(true);
			continueRender(handle);
		};
		document.fonts.load(font, glyphs).then(done, done);
	}, [font, glyphs, handle]);
	return ready;
};
