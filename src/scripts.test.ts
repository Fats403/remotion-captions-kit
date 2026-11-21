import {describe, expect, test} from 'vitest';
import {textDirection, textWidth, tokenSpacing} from './scripts';

describe('tokenSpacing', () => {
	test('spaces Latin words and draws the space outside the word', () => {
		expect(tokenSpacing(['every', ' great', ' video'])).toEqual([
			{text: 'every', space: ''},
			{text: 'great', space: ' '},
			{text: 'video', space: ' '},
		]);
	});

	test('joins Japanese, Chinese and Thai words without a space', () => {
		// The pieces a word breaker cuts "三台の自転車が" into.
		expect(tokenSpacing(['三台', ' の', ' 自転車', ' が']).map((t) => t.space)).toEqual(['', '', '', '']);
		expect(tokenSpacing(['打开', ' 工坊。', ' 到']).map((t) => t.space)).toEqual(['', '', '']);
		expect(tokenSpacing(['ทุก', ' เช้า', ' ผม']).map((t) => t.space)).toEqual(['', '', '']);
	});

	test('keeps a space where a script without spaces meets one with them', () => {
		expect(tokenSpacing(['iPhone', ' を']).map((t) => t.space)).toEqual(['', ' ']);
		expect(tokenSpacing(['매일', ' 아침']).map((t) => t.space)).toEqual(['', ' ']);
	});

	test('reads past punctuation and digits to the letters either side', () => {
		expect(tokenSpacing(['工房を開けます。', ' 9時には']).map((t) => t.space)).toEqual(['', '']);
	});
});

describe('textDirection', () => {
	test.for([
		['وبحلول الساعة التاسعة', 'rtl'],
		['בוקר טוב', 'rtl'],
		['"وبحلول"', 'rtl'],
		['9 بحلول', 'rtl'],
		['Every great video', 'ltr'],
		['毎朝', 'ltr'],
		['नमस्ते', 'ltr'],
		['', 'ltr'],
	] as const)('%s reads %s', ([text, direction]) => {
		expect(textDirection(text)).toBe(direction);
	});
});

describe('textWidth', () => {
	test('counts Chinese, Japanese and Korean characters as two', () => {
		expect(textWidth('video')).toBe(5);
		expect(textWidth('自転車')).toBe(6);
		expect(textWidth('자전거')).toBe(6);
		expect(textWidth('9時')).toBe(3);
		expect(textWidth('Доброе')).toBe(6);
	});
});
