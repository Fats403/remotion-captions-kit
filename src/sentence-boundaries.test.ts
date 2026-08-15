import {describe, expect, test} from 'vitest';
import {endsClause, endsSentence} from './sentence-boundaries';

describe('endsSentence', () => {
	test.for([
		// Plain sentence ends.
		['page.', 'This', true],
		['final.', undefined, true],
		['really?', 'yes', true],
		['stop!', 'go', true],
		['wait…', 'no', true],
		['what?!', 'no', true],
		['hello', 'there', false],
		['', 'there', false],

		// Terminators wrapped in closing punctuation.
		['"done."', 'next', true],
		['“done.”', 'next', true],
		["'done.'", 'next', true],
		['(done.)', 'Next', true],
		['[done.]', 'Next', true],
		['“done!”', 'next', true],

		// Titles never end a sentence, however capitalised the next word is.
		['Dr.', 'Chen', false],
		['Mr.', 'Smith', false],
		['Mrs.', 'Smith', false],
		['Prof.', 'Jones', false],
		['St.', 'Louis', false],
		['Mt.', 'Fuji', false],
		['Sgt.', 'Pepper', false],
		['vs.', 'The', false],
		['Vol.', 'II', false],
		['approx.', 'Ten', false],

		// Ambiguous enders: the next word decides.
		['U.S.', 'market', false],
		['U.S.', 'Then', true],
		['a.m.', 'we', false],
		['a.m.', 'We', true],
		['e.g.', 'this', false],
		['etc.', 'and', false],
		['etc.', 'We', true],
		['Inc.', 'said', false],
		['Inc.', 'Then', true],
		['3.', 'apples', false],
		['3.', 'Add', true],
		['Ph.D.', 'programme', false],

		// A lone initial is never a sentence end: "J. R. R. Tolkien".
		['J.', 'R.', false],
		['J.', 'Smith', false],
		['F.', 'Scott', false],

		// A decimal is not a terminator at all.
		['$1.5', 'million', false],
		['3.14', 'radians', false],

		// "No." is the spoken word, not an abbreviation for "number".
		['No.', 'I', true],
		['No.', 'that', true],

		// An ambiguous ender with nothing after it has to count.
		['U.S.', undefined, true],
		['etc.', undefined, true],
	] as [string, string | undefined, boolean][])(
		'%o followed by %o -> %o',
		([word, next, expected]) => {
			expect(endsSentence(word, next)).toBe(expected);
		},
	);
});

describe('endsClause', () => {
	test.for([
		['car,', true],
		['however;', true],
		['this:', true],
		['wait—', true],
		['pause–', true],
		['"quoted,"', true],
		['car', false],
		['page.', false],
		['really?', false],
		['', false],
	] as [string, boolean][])('%o -> %o', ([word, expected]) => {
		expect(endsClause(word)).toBe(expected);
	});
});
