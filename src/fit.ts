import type {TikTokPage} from '@remotion/captions';
import {useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {layoutFont, lineWidth, makeMeasure, type PresetLayout, useFontReady} from './measure';
import {tokenSpacing} from './scripts';
import {resolveTheme, type ResolvedTheme} from './theme';
import type {CaptionTheme} from './types';

/**
 * How far a page's type comes down so its widest word fits the line: 1
 * when everything fits, less when one word (a German compound, a URL)
 * would otherwise run off the frame.
 */
export const fitScale = (words: string[], measure: (text: string) => number, available: number): number => {
	const widest = Math.max(0, ...words.map((w) => measure(w)));
	return widest > available ? available / widest : 1;
};

/**
 * The theme a preset draws a page in, its size brought down so the page's
 * widest word fits. The whole page shrinks together, so its words stay one
 * size. Measured as pages are, in the theme's font at the preset's weight
 * and case; the frame waits for the font to load first.
 */
export const useFitTheme = ({
	page,
	theme,
	layout,
}: {
	page: TikTokPage;
	theme?: CaptionTheme;
	layout: PresetLayout;
}): ResolvedTheme => {
	const t = resolveTheme(theme);
	const {width} = useVideoConfig();
	const {font, px, uppercase} = layoutFont(t, layout);
	const words = useMemo(() => tokenSpacing(page.tokens.map((token) => token.text)).map(({text}) => text), [page]);
	const text = words.join('');
	const fontReady = useFontReady(font, uppercase ? text.toUpperCase() : text);
	const scale = useMemo(() => {
		const measure = makeMeasure(font, uppercase);
		if (!measure) {
			return 1;
		}
		return fitScale(words, measure, lineWidth(width, t, layout, px));
		// fontReady: measure again once the real font is in.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [words, font, uppercase, width, t.paddingX, t.maxWidth, layout.chromeEm, px, fontReady]);
	return scale < 1 ? {...t, fontSize: t.fontSize * scale} : t;
};
