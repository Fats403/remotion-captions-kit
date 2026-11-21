import {expect, test} from 'vitest';
import {fitScale} from './fit';

// A stand-in font: every character 10px wide.
const measure = (text: string) => text.length * 10;

test('leaves a page alone when every word fits the line', () => {
	expect(fitScale(['every', 'great', 'video'], measure, 300)).toBe(1);
});

test('brings the page down so its widest word fits', () => {
	// "Donaudampfschifffahrtsgesellschaft" is 34 characters, 340px, on a 170px line.
	expect(fitScale(['die', 'Donaudampfschifffahrtsgesellschaft'], measure, 170)).toBe(0.5);
});

test('an empty page needs no fitting', () => {
	expect(fitScale([], measure, 100)).toBe(1);
});
