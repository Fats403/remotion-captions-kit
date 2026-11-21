import type {TikTokPage} from '@remotion/captions';

/**
 * The same pages as a subtitle file, for the platforms that take one
 * beside the video (YouTube, LinkedIn, a player's CC button). Each cue is a
 * page, shown for as long as the captions show it, in the page's own text,
 * so it breaks where the captions do.
 */

const stamp = (ms: number, separator: ',' | '.'): string => {
	const whole = Math.max(0, Math.round(ms));
	const pad = (n: number, width = 2) => String(n).padStart(width, '0');
	const hours = Math.floor(whole / 3_600_000);
	const minutes = Math.floor((whole % 3_600_000) / 60_000);
	const seconds = Math.floor((whole % 60_000) / 1000);
	return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}${separator}${pad(whole % 1000, 3)}`;
};

const cues = (pages: TikTokPage[], separator: ',' | '.') =>
	pages
		.filter((p) => p.text.trim() !== '')
		.map((p) => ({
			time: `${stamp(p.startMs, separator)} --> ${stamp(p.startMs + p.durationMs, separator)}`,
			text: p.text.trim(),
		}));

/** SubRip (.srt). */
export const pagesToSrt = (pages: TikTokPage[]): string =>
	cues(pages, ',')
		.map((c, i) => `${i + 1}\n${c.time}\n${c.text}\n`)
		.join('\n');

/** WebVTT (.vtt), the format browsers' <track> elements read. */
export const pagesToVtt = (pages: TikTokPage[]): string =>
	`WEBVTT\n\n${cues(pages, '.')
		.map((c) => `${c.time}\n${c.text}\n`)
		.join('\n')}`;
