import {expect, test} from 'vitest';
import {captionsFromWords} from './captions-from-words';
import {createCaptionPages} from './create-caption-pages';
import {pagesToSrt, pagesToVtt} from './subtitles';

const {pages} = createCaptionPages({
	captions: captionsFromWords({
		words: [
			{word: 'the', start: 0, end: 0.2},
			{word: 'blank', start: 0.2, end: 0.5},
			{word: 'page.', start: 0.5, end: 0.9},
			{word: '毎朝、', start: 61.2, end: 62},
			{word: '工房を', start: 62, end: 62.6},
			{word: '開けます。', start: 62.6, end: 63.4},
		],
	}).captions,
	maxDurationMs: 3000,
});

test('writes each page as an SRT cue, held as long as the captions hold it', () => {
	expect(pagesToSrt(pages)).toBe(
		'1\n00:00:00,000 --> 00:01:01,200\nthe blank page.\n\n2\n00:01:01,200 --> 00:01:03,400\n毎朝、工房を開けます。\n',
	);
});

test('writes WebVTT with its header and dotted milliseconds', () => {
	expect(pagesToVtt(pages)).toBe(
		'WEBVTT\n\n00:00:00.000 --> 00:01:01.200\nthe blank page.\n\n00:01:01.200 --> 00:01:03.400\n毎朝、工房を開けます。\n',
	);
});
