/**
 * Writing systems the presets lay out differently. Every preset assumed a
 * left-to-right script with spaces between words, so Japanese came out
 * "三台 の 自転車 が" and Arabic read backwards in KaraokeFill.
 */

/** Scripts written without spaces between words. */
const NO_SPACE =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;

/** Scripts read right to left. */
const RIGHT_TO_LEFT =
	/[\p{Script=Arabic}\p{Script=Hebrew}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Adlam}]/u;

/** Characters a line of type spends about two Latin letters' width on. */
const WIDE =
	/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}　-〿！-｠]/u;

const firstLetter = (s: string): string => s.match(/\p{L}/u)?.[0] ?? '';
const lastLetter = (s: string): string => s.match(/\p{L}(?=\P{L}*$)/u)?.[0] ?? '';

/** The direction a line reads in, from its first letter. */
export const textDirection = (text: string): 'ltr' | 'rtl' =>
	RIGHT_TO_LEFT.test(firstLetter(text)) ? 'rtl' : 'ltr';

/**
 * A page's words as presets draw them: each without its leading space, and
 * the space that goes before it, drawn between the word boxes rather than
 * inside them. That space is where a line can wrap (inside a
 * `white-space: pre` word it never could, so PillKaraoke ran off both
 * edges), and it's left out where two words of a script without spaces
 * meet ("自転車" then "が").
 */
export const tokenSpacing = (texts: string[]): {text: string; space: string}[] =>
	texts.map((raw, i) => {
		const text = raw.replace(/^\s+/u, '');
		if (i === 0) {
			return {text, space: ''};
		}
		const joined =
			NO_SPACE.test(lastLetter(texts[i - 1])) && NO_SPACE.test(firstLetter(text));
		return {text, space: joined ? '' : ' '};
	});

/**
 * Length as a line spends it, for the character cap: a Chinese, Japanese
 * or Korean character counts as two, so a page of them fits the same
 * width a page of Latin letters does.
 */
export const textWidth = (s: string): number => {
	let width = 0;
	for (const ch of s) {
		width += WIDE.test(ch) ? 2 : 1;
	}
	return width;
};
