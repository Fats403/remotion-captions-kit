import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutBack, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const POP_MS = 150;

/**
 * One big word at a time, popping in as it's said and holding until the
 * next: the fastest-reading style for high-energy edits. Shows the latest
 * spoken word of whatever page it's given, so it works on any pagination,
 * though one word a page keeps the timing exact.
 */
export const OneWord: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.OneWord});
	const {tokens, timeMs, direction} = useTokenStates({page});
	const spoken = tokens.filter((s) => s.hasAppeared);
	const current = spoken[spoken.length - 1] ?? tokens[0];

	if (!current) {
		return null;
	}

	const em = resolveEmphasis({token: current.token, index: current.index, rules: emphasis});
	const p = easeOutBack(windowProgress(timeMs, current.token.fromMs, POP_MS));
	const fontSize = t.fontSize * 1.4;

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				key={current.token.fromMs}
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize,
					...typeStyle(t, {fontWeight: 900, uppercase: true, strokeWidth: fontSize * 0.07}),
					color: em?.color ?? t.textColor,
					textAlign: 'center',
					lineHeight: 1.05,
					textShadow: `0 ${fontSize * 0.06}px 0 rgba(0,0,0,0.55)`,
					transform: `scale(${0.7 + 0.3 * p})`,
					...em?.style,
				}}
			>
				{current.text}
			</div>
		</AbsoluteFill>
	);
};
