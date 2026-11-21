import {describe, expect, test} from 'vitest';
import {placementStyle, resolveTheme, SAFE_AREAS, typeStyle} from './theme';


describe('placement', () => {
	test('edgeOffset is the bottom edge, a fraction of the height, not padding', () => {
		// Before 1.0 it was paddingBottom: 18%, which measures the width.
		const style = placementStyle(resolveTheme({position: 'bottom', edgeOffset: 0.18}));
		expect(style).toMatchObject({bottom: '18%', top: 0, height: 'auto', paddingLeft: '6%'});
		expect(style.paddingBottom).toBeUndefined();
	});

	test('a safe area clears the platform, and anything set by hand still wins', () => {
		const tiktok = resolveTheme({safeArea: 'tiktok'});
		expect(tiktok.edgeOffset).toBe(SAFE_AREAS.tiktok.bottom);
		expect(tiktok.paddingX).toBe(SAFE_AREAS.tiktok.side);
		expect(resolveTheme({safeArea: 'tiktok', position: 'top'}).edgeOffset).toBe(SAFE_AREAS.tiktok.top);
		expect(resolveTheme({safeArea: 'tiktok', edgeOffset: 0.3}).edgeOffset).toBe(0.3);
	});

	test('at center, edgeOffset lifts the block, and is 0 unless set', () => {
		expect(placementStyle(resolveTheme({position: 'center'})).bottom).toBe('0%');
		expect(placementStyle(resolveTheme({position: 'center', edgeOffset: 0.1})).bottom).toBe('20%');
	});
});

describe('typeStyle', () => {
	test('draws the outline behind the letters at twice the width', () => {
		expect(typeStyle(resolveTheme({strokeWidth: 4, strokeColor: '#111'}), {fontWeight: 800})).toMatchObject({
			WebkitTextStroke: '8px #111',
			paintOrder: 'stroke fill',
		});
	});

	test("takes the preset's weight, case and outline unless the theme sets its own", () => {
		const preset = {fontWeight: 900, uppercase: true, strokeWidth: 5};
		expect(typeStyle(resolveTheme(), preset)).toMatchObject({fontWeight: 900, textTransform: 'uppercase', WebkitTextStroke: '10px #000000'});
		expect(typeStyle(resolveTheme({fontWeight: 600, uppercase: false, strokeWidth: 0}), preset)).toEqual({
			fontWeight: 600,
			textTransform: undefined,
		});
	});
});
