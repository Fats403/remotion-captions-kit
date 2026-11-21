import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutBack, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const POP_MS = 140;

/**
 * The short-form default: a few heavy capitals with a black outline, the
 * spoken word thrown into the accent color with a quick pop. The look
 * CapCut ships as its standard and Submagic sells as "Hormozi". Pair it
 * with short pages (two or three words).
 */
export const PopHighlight: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme: {activeColor: '#ffe600', ...theme}, layout: LAYOUTS.PopHighlight});
	const {tokens, timeMs, direction} = useTokenStates({page});

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize,
					...typeStyle(t, {fontWeight: 900, uppercase: true, strokeWidth: t.fontSize * 0.06}),
					color: t.textColor,
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.15,
					letterSpacing: '0.01em',
					// The outline and the pop eat into a plain space.
					wordSpacing: '0.14em',
					textShadow: `0 ${t.fontSize * 0.06}px 0 rgba(0,0,0,0.55)`,
				}}
			>
				{tokens.map(({token, index, isActive, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const pop = isActive ? easeOutBack(windowProgress(timeMs, token.fromMs, POP_MS)) : 0;

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									display: 'inline-block',
									whiteSpace: 'pre',
									color: isActive ? (em?.color ?? t.activeColor) : (em?.color ?? t.textColor),
									transform: `scale(${1 + 0.06 * pop})`,
									...em?.style,
								}}
							>
								{text}
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
