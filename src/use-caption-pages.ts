import type {Caption, TikTokPage} from '@remotion/captions';
import {useMemo} from 'react';
import {createCaptionPages} from './create-caption-pages';

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
};

/**
 * Memoized pagination via createCaptionPages(), sentence- and
 * pause-aware, unlike the stock time-window-only paginator.
 */
export const useCaptionPages = ({
	captions,
	maxDurationMs = 1200,
	silenceGapMs = 400,
	breakOnPunctuation = true,
}: UseCaptionPagesInput): {pages: TikTokPage[]} => {
	return useMemo(
		() =>
			createCaptionPages({
				captions,
				maxDurationMs,
				silenceGapMs,
				breakOnPunctuation,
			}),
		[captions, maxDurationMs, silenceGapMs, breakOnPunctuation],
	);
};
