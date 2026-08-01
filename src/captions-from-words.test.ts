import {expect, test} from 'vitest';
import {captionsFromWords} from './captions-from-words';

test('converts seconds to milliseconds by default', () => {
	const {captions} = captionsFromWords({
		words: [{word: 'hi', start: 1.5, end: 2}],
	});
	expect(captions[0]).toEqual({
		text: ' hi',
		startMs: 1500,
		endMs: 2000,
		timestampMs: 1500,
		confidence: null,
	});
});

test('passes milliseconds through unscaled', () => {
	const {captions} = captionsFromWords({
		words: [{word: 'hi', start: 1500, end: 2000}],
		timeUnit: 'milliseconds',
	});
	expect(captions[0].startMs).toBe(1500);
	expect(captions[0].endMs).toBe(2000);
});

test('prefixes every word with a space and trims stray whitespace', () => {
	const {captions} = captionsFromWords({
		words: [{word: '  spaced  ', start: 0, end: 1}],
	});
	expect(captions[0].text).toBe(' spaced');
});
