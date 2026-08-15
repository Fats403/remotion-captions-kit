import type {Caption} from '@remotion/captions';
import {expect, test} from 'vitest';
import {createCaptionPages} from './create-caption-pages';

/**
 * Property tests: whatever the input, some things must always hold. Seeded
 * PRNG, so every run checks the same 200 streams — failures reproduce.
 */

const mulberry32 = (seed: number) => {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
};

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const SUFFIXES = ['', '', '', '', '.', ',', '!', '?', '…', '."', ',”'];

const randomStream = (rand: () => number): Caption[] => {
	const count = 1 + Math.floor(rand() * 60);
	const captions: Caption[] = [];
	let cursor = Math.floor(rand() * 1000);

	for (let i = 0; i < count; i++) {
		let word = '';
		const len = 1 + Math.floor(rand() * 12);
		for (let j = 0; j < len; j++) {
			word += LETTERS[Math.floor(rand() * LETTERS.length)];
		}
		word += SUFFIXES[Math.floor(rand() * SUFFIXES.length)];

		const startMs = cursor;
		const endMs = startMs + 50 + Math.floor(rand() * 500);
		// Sometimes a pause, sometimes back-to-back.
		cursor = endMs + (rand() < 0.3 ? Math.floor(rand() * 900) : 0);

		captions.push({
			text: ' ' + word,
			startMs,
			endMs,
			timestampMs: startMs,
			confidence: null,
		});
	}

	return captions;
};

const randomOptions = (rand: () => number) => ({
	maxDurationMs: 500 + Math.floor(rand() * 3000),
	silenceGapMs: 100 + Math.floor(rand() * 800),
	breakOnPunctuation: rand() < 0.8,
	maxCharsPerPage: 15 + Math.floor(rand() * 60),
	minDurationMs: rand() < 0.2 ? 0 : Math.floor(rand() * 500),
	minWordsPerPage: 1 + Math.floor(rand() * 3),
});

test('invariants hold across 200 random streams', () => {
	for (let seed = 1; seed <= 200; seed++) {
		const rand = mulberry32(seed);
		const captions = randomStream(rand);
		const options = randomOptions(rand);
		const {pages} = createCaptionPages({captions, ...options});
		const label = `seed ${seed} ${JSON.stringify(options)}`;

		// Every word in, every word out, in order, spaces intact.
		const inputText = captions.map((c) => c.text.trim()).join(' ');
		const outputText = pages.map((p) => p.text).join(' ');
		expect(outputText, label).toBe(inputText);

		for (const page of pages) {
			// Page text is exactly its tokens joined.
			expect(page.tokens.map((t) => t.text).join(''), label).toBe(page.text);
			// Durations are finite and non-negative, always.
			expect(Number.isFinite(page.durationMs), label).toBe(true);
			expect(page.durationMs, label).toBeGreaterThanOrEqual(0);
			// A page never starts before its first word.
			expect(page.startMs, label).toBe(page.tokens[0].fromMs);
		}

		// Pages are in order and never overlap on screen.
		for (let i = 1; i < pages.length; i++) {
			const prevEnd = pages[i - 1].startMs + pages[i - 1].durationMs;
			expect(prevEnd, label).toBeLessThanOrEqual(pages[i].startMs);
		}
	}
});

test('malformed streams still come out with sane pages', () => {
	for (let seed = 1; seed <= 50; seed++) {
		const rand = mulberry32(seed * 7919);
		const captions = randomStream(rand);

		// Corrupt it: shuffle order, break some timings, blank some text.
		for (let i = captions.length - 1; i > 0; i--) {
			const j = Math.floor(rand() * (i + 1));
			[captions[i], captions[j]] = [captions[j], captions[i]];
		}
		for (const caption of captions) {
			const roll = rand();
			if (roll < 0.05) {
				caption.startMs = Number.NaN;
			} else if (roll < 0.1) {
				[caption.startMs, caption.endMs] = [caption.endMs, caption.startMs];
			} else if (roll < 0.15) {
				caption.text = '   ';
			}
		}

		const {pages} = createCaptionPages({captions, ...randomOptions(rand)});
		const label = `seed ${seed * 7919}`;

		for (const page of pages) {
			expect(page.text.trim(), label).not.toBe('');
			expect(page.tokens.map((t) => t.text).join(''), label).toBe(page.text);
			expect(Number.isFinite(page.durationMs), label).toBe(true);
			expect(page.durationMs, label).toBeGreaterThanOrEqual(0);
		}

		for (let i = 1; i < pages.length; i++) {
			expect(pages[i].startMs, label).toBeGreaterThanOrEqual(
				pages[i - 1].startMs,
			);
		}
	}
});
