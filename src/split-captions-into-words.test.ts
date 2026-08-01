import {parseSrt} from '@remotion/captions';
import {expect, test} from 'vitest';
import {createCaptionPages} from './create-caption-pages';
import {splitCaptionsIntoWords} from './split-captions-into-words';

const SRT = `1
00:00:00,000 --> 00:00:02,000
every great video starts

2
00:00:02,500 --> 00:00:04,000
with a story worth telling.

3
00:00:04,600 --> 00:00:06,000
This is where you start.
`;

test('splits SRT cues into per-word captions', () => {
	const {captions} = parseSrt({input: SRT});
	const {captions: split} = splitCaptionsIntoWords({captions});

	expect(split.map((c) => c.text)).toEqual([
		' every',
		' great',
		' video',
		' starts',
		' with',
		' a',
		' story',
		' worth',
		' telling.',
		' This',
		' is',
		' where',
		' you',
		' start.',
	]);
});

test('word durations are proportional to length and cover the cue exactly', () => {
	const {captions: split} = splitCaptionsIntoWords({
		captions: [
			{
				text: 'go elsewhere',
				startMs: 0,
				endMs: 1200,
				timestampMs: 600,
				confidence: 1,
			},
		],
	});

	// "go" (2 chars) gets 2/11 of 1200ms, "elsewhere" (9 chars) the rest.
	expect(split[0].startMs).toBe(0);
	expect(split[0].endMs).toBeCloseTo(1200 * (2 / 11), 6);
	expect(split[1].startMs).toBe(split[0].endMs);
	expect(split[1].endMs).toBe(1200);
});

test('words never bleed across cue boundaries', () => {
	const {captions: split} = splitCaptionsIntoWords({
		captions: [
			{text: 'one two', startMs: 0, endMs: 1000, timestampMs: 0, confidence: 1},
			{text: 'three', startMs: 1500, endMs: 2000, timestampMs: 1500, confidence: 1},
		],
	});
	expect(Math.max(...split.slice(0, 2).map((c) => c.endMs))).toBe(1000);
	expect(split[2].startMs).toBe(1500);
});

test('SRT flows end-to-end into sentence-aware pages', () => {
	const {captions} = parseSrt({input: SRT});
	const {captions: split} = splitCaptionsIntoWords({captions});
	const {pages} = createCaptionPages({captions: split, maxDurationMs: 2500});

	// "telling." ends its page at the sentence; the pause before cue 3
	// would break it anyway.
	expect(pages.map((p) => p.text)).toEqual([
		'every great video starts',
		'with a story worth telling.',
		'This is where you start.',
	]);
});

test('empty and whitespace-only cues are dropped', () => {
	const {captions: split} = splitCaptionsIntoWords({
		captions: [
			{text: '   ', startMs: 0, endMs: 500, timestampMs: 0, confidence: 1},
		],
	});
	expect(split).toEqual([]);
});
