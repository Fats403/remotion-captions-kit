import type {Caption, TikTokPage, TikTokToken} from '@remotion/captions';

export type CreateCaptionPagesInput = {
	captions: Caption[];
	/**
	 * Soft cap on how much speech a page holds. A page breaks before the
	 * word that would push it past this. Default 1200.
	 */
	maxDurationMs?: number;
	/**
	 * A silence of at least this length between words starts a new page:
	 * a pause is a beat, and captions should breathe with it. Default 400.
	 */
	silenceGapMs?: number;
	/**
	 * Break after words ending in sentence punctuation (. ! ? … and their
	 * quote-wrapped forms). Default true.
	 */
	breakOnPunctuation?: boolean;
};

export type CreateCaptionPagesOutput = {
	pages: TikTokPage[];
};

const SENTENCE_END = /[.!?…]["')\]]?$/;

/**
 * Sentence- and pause-aware alternative to createTikTokStyleCaptions().
 *
 * The stock paginator groups purely by time window, so a page can read
 * "the blank page. This", welding a sentence end to the start of the
 * next one across a pause. This paginator breaks on sentence punctuation
 * and on silences, then falls back to the duration cap.
 *
 * Emits the same TikTokPage shape, so every preset (and anything else
 * built on @remotion/captions) consumes it unchanged. Like the stock
 * paginator, each page's durationMs extends to the start of the next
 * page, so captions hold on screen through pauses.
 */
export const createCaptionPages = ({
	captions,
	maxDurationMs = 1200,
	silenceGapMs = 400,
	breakOnPunctuation = true,
}: CreateCaptionPagesInput): CreateCaptionPagesOutput => {
	const pages: TikTokPage[] = [];
	let tokens: TikTokToken[] = [];
	let pageStart = 0;
	let pageEnd = 0;

	const flush = () => {
		if (tokens.length === 0) {
			return;
		}
		pages.push({
			text: tokens.map((t) => t.text).join(''),
			startMs: pageStart,
			tokens,
			durationMs: pageEnd - pageStart,
		});
		if (pages.length > 1) {
			const prev = pages[pages.length - 2];
			prev.durationMs = pageStart - prev.startMs;
		}
		tokens = [];
	};

	for (const caption of captions) {
		const text = caption.text;
		if (text.trim() === '') {
			continue;
		}

		const startsPage =
			tokens.length > 0 &&
			// A pause long enough to be a beat.
			(caption.startMs - pageEnd >= silenceGapMs ||
				// This word would overfill the page.
				caption.endMs - pageStart > maxDurationMs);

		if (startsPage) {
			flush();
		}

		if (tokens.length === 0) {
			pageStart = caption.startMs;
		}

		tokens.push({
			// First word of a page drops its leading space.
			text: tokens.length === 0 ? text.trimStart() : text,
			fromMs: caption.startMs,
			toMs: caption.endMs,
		});
		pageEnd = caption.endMs;

		if (breakOnPunctuation && SENTENCE_END.test(text.trimEnd())) {
			flush();
		}
	}

	flush();

	return {pages};
};
