import {expect, test} from 'vitest';
import {resolveEmphasis} from './emphasis';

const token = (text: string) => ({text, fromMs: 0, toMs: 100});

test('matches words case-insensitively, ignoring punctuation and spaces', () => {
	const rules = [{words: ['start'], color: '#FFD400'}];
	expect(
		resolveEmphasis({token: token(' Start.'), index: 0, rules}),
	).toEqual({color: '#FFD400', style: undefined});
	expect(resolveEmphasis({token: token(' restart'), index: 0, rules})).toBe(
		null,
	);
});

test('predicate matching receives the token and its index', () => {
	const rules = [
		{match: (_t: unknown, i: number) => i === 2, style: {fontStyle: 'italic' as const}},
	];
	expect(resolveEmphasis({token: token(' a'), index: 1, rules})).toBe(null);
	expect(
		resolveEmphasis({token: token(' a'), index: 2, rules})?.style,
	).toEqual({fontStyle: 'italic'});
});

test('later rules win on color; styles merge', () => {
	const rules = [
		{words: ['key'], color: '#111111', style: {fontStyle: 'italic' as const}},
		{words: ['key'], color: '#222222', style: {fontWeight: 900 as const}},
	];
	const resolved = resolveEmphasis({token: token(' key'), index: 0, rules});
	expect(resolved?.color).toBe('#222222');
	expect(resolved?.style).toEqual({fontStyle: 'italic', fontWeight: 900});
});

test('no rules or no match resolves to null', () => {
	expect(resolveEmphasis({token: token(' word'), index: 0, rules: []})).toBe(
		null,
	);
	expect(
		resolveEmphasis({token: token(' word'), index: 0, rules: undefined}),
	).toBe(null);
});
