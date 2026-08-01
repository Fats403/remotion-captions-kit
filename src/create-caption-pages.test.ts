import {expect, test} from 'vitest';
import {captionsFromWords} from './captions-from-words';
import {createCaptionPages} from './create-caption-pages';

const words = (
	list: [string, number, number][],
): ReturnType<typeof captionsFromWords>['captions'] =>
	captionsFromWords({
		words: list.map(([word, start, end]) => ({word, start, end})),
	}).captions;

test('breaks after sentence-ending punctuation', () => {
	const captions = words([
		['the', 0, 0.2],
		['blank', 0.2, 0.5],
		['page.', 0.5, 0.9],
		['This', 1.0, 1.2],
		['continues', 1.2, 1.6],
	]);
	const {pages} = createCaptionPages({captions});
	expect(pages.map((p) => p.text)).toEqual([
		'the blank page.',
		'This continues',
	]);
});

test('breaks on ? and ! and punctuation inside quotes', () => {
	const captions = words([
		['really?', 0, 0.3],
		['yes!', 0.4, 0.6],
		['"done."', 0.7, 1.0],
		['next', 1.1, 1.3],
	]);
	const {pages} = createCaptionPages({captions});
	expect(pages.map((p) => p.text)).toEqual([
		'really?',
		'yes!',
		'"done."',
		'next',
	]);
});

test('punctuation breaking can be turned off', () => {
	const captions = words([
		['page.', 0, 0.3],
		['This', 0.35, 0.6],
	]);
	const {pages} = createCaptionPages({captions, breakOnPunctuation: false});
	expect(pages).toHaveLength(1);
	expect(pages[0].text).toBe('page. This');
});

test('a silence gap starts a new page', () => {
	const captions = words([
		['hello', 0, 0.3],
		['there', 0.32, 0.6],
		['again', 1.2, 1.5], // 600ms gap
	]);
	const {pages} = createCaptionPages({captions, silenceGapMs: 400});
	expect(pages.map((p) => p.text)).toEqual(['hello there', 'again']);
});

test('a word that would overfill the page starts a new one', () => {
	const captions = words([
		['one', 0, 0.4],
		['two', 0.4, 0.8],
		['three', 0.8, 1.3],
	]);
	const {pages} = createCaptionPages({captions, maxDurationMs: 1000});
	expect(pages.map((p) => p.text)).toEqual(['one two', 'three']);
});

test('durationMs extends to the start of the next page (hold through pause)', () => {
	const captions = words([
		['first', 0, 0.3],
		['second', 1.3, 1.6], // 1s pause
	]);
	const {pages} = createCaptionPages({captions});
	expect(pages[0].startMs).toBe(0);
	expect(pages[0].durationMs).toBe(1300);
	expect(pages[1].durationMs).toBe(300);
});

test('tokens keep exact word timings and leading spaces', () => {
	const captions = words([
		['alpha', 0, 0.5],
		['beta', 0.5, 1.0],
	]);
	const {pages} = createCaptionPages({captions});
	expect(pages[0].tokens).toEqual([
		{text: 'alpha', fromMs: 0, toMs: 500},
		{text: ' beta', fromMs: 500, toMs: 1000},
	]);
});

test('empty input yields no pages', () => {
	expect(createCaptionPages({captions: []}).pages).toEqual([]);
});
