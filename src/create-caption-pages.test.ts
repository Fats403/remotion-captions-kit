import type {Caption} from '@remotion/captions';
import {describe, expect, test} from 'vitest';
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
	// minDurationMs off: this is about where the breaks land, not about
	// whether the resulting pages are long enough to read.
	const {pages} = createCaptionPages({
		captions,
		minDurationMs: 0,
		minWordsPerPage: 1,
	});
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

test('page text is always the tokens joined, with no missing spaces', () => {
	const captions = words([
		['one', 0, 0.3],
		['two', 0.3, 0.6],
		['three', 0.6, 0.9],
	]);
	const {pages} = createCaptionPages({captions});
	for (const page of pages) {
		expect(page.tokens.map((t) => t.text).join('')).toBe(page.text);
	}
});

test('no page is ever left with an infinite duration', () => {
	// The stock paginator initialises durationMs to Infinity and relies on a
	// later page to correct it, which leaks straight into durationInFrames.
	const captions = words([
		['one', 0, 0.5],
		['two', 0.5, 1.0],
		['three', 3.0, 3.5],
	]);
	const {pages} = createCaptionPages({captions});
	expect(pages.length).toBeGreaterThan(0);
	for (const page of pages) {
		expect(Number.isFinite(page.durationMs)).toBe(true);
		expect(page.durationMs).toBeGreaterThan(0);
	}
});

describe('whitespace independence', () => {
	test('captions with no leading spaces still separate into words', () => {
		const captions: Caption[] = [
			{
				text: 'hello',
				startMs: 0,
				endMs: 300,
				timestampMs: 0,
				confidence: null,
			},
			{
				text: 'there',
				startMs: 300,
				endMs: 600,
				timestampMs: 300,
				confidence: null,
			},
			{
				text: 'friend',
				startMs: 600,
				endMs: 900,
				timestampMs: 600,
				confidence: null,
			},
		];
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['hello there friend']);
	});
});

describe('abbreviations', () => {
	test('a title does not end a page', () => {
		const captions = words([
			['Dr.', 0, 0.2],
			['Chen', 0.2, 0.4],
			['spoke', 0.4, 0.6],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['Dr. Chen spoke']);
	});

	test('an acronym mid-sentence does not end a page', () => {
		const captions = words([
			['the', 0, 0.15],
			['U.S.', 0.15, 0.4],
			['market', 0.4, 0.7],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['the U.S. market']);
	});

	test('an acronym before a capitalised word does end a page', () => {
		const captions = words([
			['left', 0, 0.2],
			['the', 0.2, 0.35],
			['U.S.', 0.35, 0.6],
			['Then', 0.6, 0.85],
			['everything', 0.85, 1.2],
			['changed', 1.2, 1.5],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual([
			'left the U.S.',
			'Then everything changed',
		]);
	});

	test('a decimal never ends a page', () => {
		const captions = words([
			['raised', 0, 0.25],
			['$1.5', 0.25, 0.5],
			['million', 0.5, 0.8],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['raised $1.5 million']);
	});

	test('a typographic closing quote after a period still breaks', () => {
		const captions = words([
			['“done.”', 0, 0.3],
			['next', 0.3, 0.5],
		]);
		const {pages} = createCaptionPages({
			captions,
			minDurationMs: 0,
			minWordsPerPage: 1,
		});
		expect(pages.map((p) => p.text)).toEqual(['“done.”', 'next']);
	});
});

describe('maxCharsPerPage', () => {
	test('a long line is split even when it fits the duration cap', () => {
		const captions = words([
			['extraordinarily', 0, 0.2],
			['complicated', 0.2, 0.4],
			['international', 0.4, 0.6],
			['transportation', 0.6, 0.8],
		]);
		const {pages} = createCaptionPages({captions, maxCharsPerPage: 30});
		for (const page of pages) {
			// The only page allowed to exceed the cap is one holding a single
			// word longer than the cap itself.
			if (page.tokens.length > 1) {
				expect(page.text.length).toBeLessThanOrEqual(30);
			}
		}
		expect(pages.length).toBeGreaterThan(1);
	});

	test('a single word longer than the cap gets its own page', () => {
		const captions = words([
			['pneumonoultramicroscopicsilicovolcanoconiosis', 0, 0.9],
			['hurts', 0.9, 1.2],
		]);
		const {pages} = createCaptionPages({captions, maxCharsPerPage: 20});
		expect(pages.map((p) => p.text)).toEqual([
			'pneumonoultramicroscopicsilicovolcanoconiosis',
			'hurts',
		]);
	});
});

describe('clause preference', () => {
	test('a cap-forced break moves back to the nearest comma', () => {
		const captions = words([
			['we', 0, 0.12],
			['packed', 0.12, 0.3],
			['the', 0.3, 0.4],
			['car,', 0.4, 0.62],
			['locked', 0.62, 0.85],
			['the', 0.85, 0.95],
			['door', 0.95, 1.15],
			['and', 1.15, 1.3],
			['left', 1.3, 1.5],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual([
			'we packed the car,',
			'locked the door and left',
		]);
	});

	test('with no clause boundary to find, the break stays where the cap fell', () => {
		const captions = words([
			['and', 0, 0.15],
			['then', 0.15, 0.3],
			['we', 0.3, 0.42],
			['went', 0.42, 0.6],
			['down', 0.6, 0.8],
			['to', 0.8, 0.9],
			['the', 0.9, 1.0],
			['river', 1.0, 1.25],
		]);
		// minWordsPerPage off: this is about where the cap break lands, not
		// about the orphan it leaves behind.
		const {pages} = createCaptionPages({
			captions,
			maxDurationMs: 1000,
			minWordsPerPage: 1,
		});
		expect(pages.map((p) => p.text)).toEqual([
			'and then we went down to the',
			'river',
		]);
	});

	test('a silence break is never rewound to a clause boundary', () => {
		const captions = words([
			['first,', 0, 0.3],
			['second', 0.3, 0.6],
			['third', 1.5, 1.8],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['first, second', 'third']);
	});
});

describe('minDurationMs', () => {
	test('flash pages are merged into one readable page', () => {
		const captions = words([
			['Yes.', 0, 0.15],
			['No.', 0.2, 0.32],
			['Maybe.', 0.4, 0.52],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['Yes. No. Maybe.']);
	});

	test('a short final page merges backwards', () => {
		const captions = words([
			['a', 0, 0.3],
			['longer', 0.3, 0.7],
			['line.', 0.7, 1.0],
			['Oh.', 1.0, 1.1],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 2000});
		expect(pages.map((p) => p.text)).toEqual(['a longer line. Oh.']);
	});

	test('merging is skipped when it would overfill a cap', () => {
		const captions = words([
			['Hi.', 0, 0.1],
			['aaaaaaaaaa', 0.15, 0.5],
			['bbbbbbbbbb', 0.5, 0.9],
		]);
		const {pages} = createCaptionPages({captions, maxCharsPerPage: 21});
		// "Hi." would show for 150ms, but merging forward blows the char cap,
		// so the short page survives rather than an overfull one.
		expect(pages[0].text).toBe('Hi.');
		for (const page of pages) {
			if (page.tokens.length > 1) {
				expect(page.text.length).toBeLessThanOrEqual(21);
			}
		}
	});

	test('setting it to 0 keeps every break', () => {
		const captions = words([
			['Yes.', 0, 0.15],
			['No.', 0.2, 0.32],
			['Maybe.', 0.4, 0.52],
		]);
		const {pages} = createCaptionPages({
			captions,
			minDurationMs: 0,
			minWordsPerPage: 1,
		});
		expect(pages.map((p) => p.text)).toEqual(['Yes.', 'No.', 'Maybe.']);
	});

	test('a page held open by a following pause is not short', () => {
		// Only 150ms of speech, but nothing follows for a second, so it sits
		// on screen for 1150ms and needs no merging.
		const captions = words([
			['Hi.', 0, 0.15],
			['Later.', 1.15, 1.5],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['Hi.', 'Later.']);
		expect(pages[0].durationMs).toBe(1150);
	});
});

describe('minWordsPerPage', () => {
	test('a stranded last word is pulled back into a fuller page', () => {
		// "This is where you" / "start." is the orphan seen in real renders:
		// the cap break lands one word before the end of the phrase.
		const captions = words([
			['This', 0, 0.25],
			['is', 0.25, 0.4],
			['where', 0.4, 0.65],
			['you', 0.65, 0.9],
			['start.', 0.9, 1.5],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 1200});
		expect(pages.map((p) => p.text)).toEqual([
			'This is where',
			'you start.',
		]);
	});

	test('setting it to 1 leaves the orphan alone', () => {
		const captions = words([
			['This', 0, 0.25],
			['is', 0.25, 0.4],
			['where', 0.4, 0.65],
			['you', 0.65, 0.9],
			['start.', 0.9, 1.5],
		]);
		const {pages} = createCaptionPages({
			captions,
			maxDurationMs: 1200,
			minWordsPerPage: 1,
		});
		expect(pages.map((p) => p.text)).toEqual([
			'This is where you',
			'start.',
		]);
	});

	test('an orphan is merged rather than shifted when there is room', () => {
		const captions = words([
			['one', 0, 0.2],
			['two', 0.2, 0.4],
			['three.', 0.4, 0.6],
			['four', 0.6, 0.8],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 1200});
		expect(pages.map((p) => p.text)).toEqual(['one two three. four']);
	});

	test('an orphan across a silence is left alone', () => {
		// A pause is a real boundary — evening out the word count across it
		// would weld two utterances together.
		const captions = words([
			['hello', 0, 0.3],
			['there', 0.32, 0.6],
			['again', 1.2, 1.5],
		]);
		const {pages} = createCaptionPages({captions});
		expect(pages.map((p) => p.text)).toEqual(['hello there', 'again']);
	});

	test('a sentence end is never shifted onto the next page', () => {
		// Evening out "we are done." / "Next" by moving "done." across would
		// give "we are" / "done. Next" — worse than the orphan.
		const captions = words([
			['we', 0, 0.2],
			['are', 0.2, 0.4],
			['done.', 0.4, 0.75],
			['Next', 0.9, 1.9],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 800});
		expect(pages.map((p) => p.text)).toEqual(['we are done.', 'Next']);
	});

	test('a donor is never reduced to an orphan itself', () => {
		const captions = words([
			['one', 0, 0.4],
			['two', 0.4, 0.8],
			['three', 0.8, 1.3],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 1000});
		// Shifting "two" across would leave "one" alone: no net gain.
		expect(pages.map((p) => p.text)).toEqual(['one two', 'three']);
	});

	test('an orphan too long to merge is shifted instead', () => {
		// "a story worth telling," is 1700ms of speech, so merging the orphan
		// back would blow a 1200ms cap. Moving one word across the break costs
		// nothing and leaves two readable pages.
		const captions = words([
			['a', 0, 0.1],
			['story', 0.1, 0.6],
			['worth', 0.75, 1.1],
			['telling,', 1.1, 1.7],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 1200});
		expect(pages.map((p) => p.text)).toEqual(['a story', 'worth telling,']);
	});

	test('a tight duration cap can strand an orphan nothing can fix', () => {
		// Merging blows the cap and the donor is already down to the minimum,
		// so there is no legal move left. Left as-is rather than papered over;
		// raising maxDurationMs is the fix.
		const captions = words([
			['story', 0, 0.6],
			['worth', 0.6, 1.1],
			['telling,', 1.1, 1.8],
		]);
		const {pages} = createCaptionPages({captions, maxDurationMs: 1200});
		expect(pages.map((p) => p.text)).toEqual(['story worth', 'telling,']);
	});

	test('a higher threshold is met as far as the caps allow', () => {
		const captions = words([
			['the', 0, 0.2],
			['quick', 0.2, 0.5],
			['brown', 0.5, 0.8],
			['fox', 0.8, 1.0],
			['jumps', 1.0, 1.3],
			['over', 1.3, 1.55],
			['the', 1.55, 1.7],
			['lazy', 1.7, 2.0],
			['dog.', 2.0, 2.4],
		]);
		const loose = createCaptionPages({captions, minWordsPerPage: 1}).pages;
		expect(loose.map((p) => p.text)).toEqual([
			'the quick brown fox',
			'jumps over the lazy',
			'dog.',
		]);

		// Asking for three words per page cannot fully land here — the donor
		// runs out before the last page reaches three — but the one-word page
		// is gone, which is the point.
		const {pages} = createCaptionPages({captions, minWordsPerPage: 3});
		expect(pages.map((p) => p.text)).toEqual([
			'the quick brown fox',
			'jumps over the',
			'lazy dog.',
		]);
	});
});

describe('malformed input', () => {
	test('overlapping words still produce non-negative durations', () => {
		const captions = words([
			['one', 0, 0.5],
			['two', 0.3, 0.8],
			['three', 0.2, 0.9],
		]);
		const {pages} = createCaptionPages({captions});
		for (const page of pages) {
			expect(page.durationMs).toBeGreaterThanOrEqual(0);
			expect(Number.isFinite(page.durationMs)).toBe(true);
		}
	});

	test('a trailing whitespace-only caption does not corrupt the last page', () => {
		const captions: Caption[] = [
			...words([
				['one', 0, 0.5],
				['two', 0.5, 1.0],
			]),
			{
				text: ' ',
				startMs: 2000,
				endMs: 2000,
				timestampMs: 2000,
				confidence: null,
			},
		];
		const {pages} = createCaptionPages({captions});
		expect(pages).toHaveLength(1);
		expect(pages[0].text).toBe('one two');
		expect(pages[0].durationMs).toBe(1000);
	});

	test('every page starts at or after the one before it', () => {
		const captions = words([
			['scrambled', 0.9, 1.2],
			['words', 0.1, 0.4],
			['arriving', 0.5, 0.8],
			['unsorted.', 1.3, 1.7],
		]);
		const {pages} = createCaptionPages({captions});
		for (let i = 1; i < pages.length; i++) {
			expect(pages[i].startMs).toBeGreaterThanOrEqual(pages[i - 1].startMs);
		}
	});
});
