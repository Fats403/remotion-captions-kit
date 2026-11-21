import type {Caption, TikTokPage} from '@remotion/captions';
import {useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {createCaptionPages} from './create-caption-pages';
import {layoutFont, lineWidth, makeMeasure, type PresetLayout, useFontReady} from './measure';
import {resolveTheme} from './theme';
import type {CaptionTheme} from './types';

export type UseCaptionPagesInput = {
	captions: Caption[];
	/**
	 * Soft cap on how much speech a page holds.
	 * Higher = more words on screen at once. Default 1200.
	 */
	maxDurationMs?: number;
	/** A silence of at least this length starts a new page. Default 400. */
	silenceGapMs?: number;
	/** Break pages after sentence-ending punctuation. Default true. */
	breakOnPunctuation?: boolean;
	/**
	 * Hard cap on characters per page. Default 42, or none when pages are
	 * measured (pass `theme`).
	 */
	maxCharsPerPage?: number;
	/** Merge pages that would show for less than this. Default 300. */
	minDurationMs?: number;
	/** Fewest words a page should hold. Default 2, set to 1 to allow orphans. */
	minWordsPerPage?: number;
	/** Most words a page holds. Default no limit. */
	maxWordsPerPage?: number;
	/**
	 * The theme the captions are set in. Passing it sizes pages by measured
	 * width: each page wraps into at most `maxLines` lines at the theme's
	 * font, size and side padding, in whatever script, instead of counting
	 * characters.
	 */
	theme?: CaptionTheme;
	/** How the preset sets its words (weight, case, chrome). Default a plain 800 weight. */
	layout?: PresetLayout;
	/** Most lines a measured page wraps into. Default 2. */
	maxLines?: number;
};

/**
 * Memoized pagination via createCaptionPages(), sentence- and
 * pause-aware, unlike the stock time-window-only paginator. Pass the
 * theme to size pages by measured width.
 */
export const useCaptionPages = ({
	captions,
	maxDurationMs = 1200,
	silenceGapMs = 400,
	breakOnPunctuation = true,
	maxCharsPerPage,
	minDurationMs = 300,
	minWordsPerPage = 2,
	maxWordsPerPage,
	theme,
	layout,
	maxLines = 2,
}: UseCaptionPagesInput): {pages: TikTokPage[]} => {
	const {width} = useVideoConfig();
	const measured = theme || layout ? resolveTheme(theme) : null;
	const preset = layout ?? {fontWeight: 800};
	const set = measured ? layoutFont(measured, preset) : null;
	const font = set?.font ?? null;
	const uppercase = set?.uppercase ?? false;
	const maxLineWidth = measured && set ? lineWidth(width, measured, preset, set.px) : undefined;
	const text = useMemo(() => captions.map((c) => c.text).join(''), [captions]);
	const fontReady = useFontReady(font, uppercase ? text.toUpperCase() : text);

	return useMemo(
		() =>
			createCaptionPages({
				captions,
				maxDurationMs,
				silenceGapMs,
				breakOnPunctuation,
				maxCharsPerPage,
				minDurationMs,
				minWordsPerPage,
				maxWordsPerPage,
				measure: font ? makeMeasure(font, uppercase) : undefined,
				maxLineWidth,
				maxLines,
			}),
		// fontReady: measure again once the real font is in.
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[
			captions,
			maxDurationMs,
			silenceGapMs,
			breakOnPunctuation,
			maxCharsPerPage,
			minDurationMs,
			minWordsPerPage,
			maxWordsPerPage,
			font,
			uppercase,
			maxLineWidth,
			maxLines,
			fontReady,
		],
	);
};
