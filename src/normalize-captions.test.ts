import type {Caption} from '@remotion/captions';
import {expect, test} from 'vitest';
import {normalizeCaptions} from './normalize-captions';

const cap = (text: string, startMs: number, endMs: number): Caption => ({
	text,
	startMs,
	endMs,
	timestampMs: startMs,
	confidence: null,
});

const texts = (captions: Caption[]) =>
	normalizeCaptions(captions).map((w) => w.text);

test('bare words with no spaces anywhere become separate words', () => {
	// The @remotion/captions footgun: this input merges into "hellothere"
	// under the stock paginator.
	expect(texts([cap('hello', 0, 300), cap('there', 300, 600)])).toEqual([
		'hello',
		'there',
	]);
});

test('leading spaces are honoured when the array uses them', () => {
	expect(texts([cap('Using', 0, 300), cap(" Remotion's", 300, 900)])).toEqual([
		'Using',
		"Remotion's",
	]);
});

test('a caption without a leading space continues the previous word', () => {
	expect(
		texts([cap(' Remo', 0, 200), cap('tion', 200, 400), cap(' rocks', 400, 700)]),
	).toEqual(['Remotion', 'rocks']);
});

test('a continuation extends the word it joins', () => {
	const [word] = normalizeCaptions([
		cap(' Remo', 0, 200),
		cap('tion', 200, 400),
	]);
	expect(word).toEqual({text: 'Remotion', startMs: 0, endMs: 400});
});

test('surrounding whitespace is stripped from every word', () => {
	expect(texts([cap('  padded  ', 0, 300), cap('\tword\n', 300, 600)])).toEqual(
		['padded', 'word'],
	);
});

test('whitespace-only captions are dropped', () => {
	expect(texts([cap(' ', 0, 100), cap(' word', 100, 300), cap('   ', 300, 400)])).toEqual(
		['word'],
	);
});

test('captions with non-finite timings are dropped', () => {
	expect(
		texts([
			cap(' good', 0, 300),
			cap(' bad', Number.NaN, 500),
			cap(' worse', 500, Number.POSITIVE_INFINITY),
			cap(' fine', 300, 600),
		]),
	).toEqual(['good', 'fine']);
});

test('out-of-order captions are sorted by start time', () => {
	expect(
		texts([cap(' third', 600, 900), cap(' first', 0, 300), cap(' second', 300, 600)]),
	).toEqual(['first', 'second', 'third']);
});

test('a word ending before it starts is clamped, not negative', () => {
	expect(normalizeCaptions([cap(' broken', 500, 200)])).toEqual([
		{text: 'broken', startMs: 500, endMs: 500},
	]);
});

test('empty input yields no words', () => {
	expect(normalizeCaptions([])).toEqual([]);
});
