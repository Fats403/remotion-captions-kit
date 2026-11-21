import type {TikTokPage} from '@remotion/captions';
import type React from 'react';
import {Fragment} from 'react';
import {AbsoluteFill} from 'remotion';
import {easeOutCubic, windowProgress} from '../ease';
import {resolveEmphasis} from '../emphasis';
import {useFitTheme} from '../fit';
import {LAYOUTS} from '../layouts';
import {placementStyle, typeStyle} from '../theme';
import type {PresetProps} from '../types';
import {useTokenStates} from '../use-token-states';

const PAGE_IN_MS = 240;
const UNDERLINE_MS = 200;

/**
 * Documentary/editorial: the whole line rises in as one piece, set in
 * sentence case at a lighter weight; an accent underline sweeps beneath
 * the active word. Emphasis rules italicize/color key words.
 */
export const EditorialEmphasis: React.FC<PresetProps & {page: TikTokPage}> = ({
	page,
	theme,
	emphasis,
}) => {
	// A word too long for the line brings the whole page down until it fits.
	const t = useFitTheme({page, theme, layout: LAYOUTS.EditorialEmphasis});
	const {tokens, timeMs, direction} = useTokenStates({page});

	const enter = easeOutCubic(windowProgress(timeMs, page.startMs, PAGE_IN_MS));

	return (
		<AbsoluteFill style={placementStyle(t)}>
			<div
				style={{
					fontFamily: t.fontFamily,
					direction,
					fontSize: t.fontSize * 0.92,
					...typeStyle(t, {fontWeight: 600}),
					textAlign: 'center',
					whiteSpace: 'pre-wrap',
					textWrap: 'balance',
					lineHeight: 1.45,
					letterSpacing: '0.005em',
					textShadow: '0 2px 14px rgba(0,0,0,0.55)',
					opacity: enter,
					transform: `translateY(${(1 - enter) * t.fontSize * 0.4}px)`,
				}}
			>
				{tokens.map(({token, index, isActive, text, space}) => {
					const em = resolveEmphasis({token, index, rules: emphasis});
					const sweep = easeOutCubic(
						windowProgress(timeMs, token.fromMs, UNDERLINE_MS),
					);

					return (
						<Fragment key={token.fromMs}>
							{space}
							<span
								style={{
									position: 'relative',
									display: 'inline-block',
									whiteSpace: 'pre',
									color: em?.color ?? t.textColor,
									...em?.style,
								}}
							>
								{text}
								<span
									aria-hidden
									style={{
										position: 'absolute',
										left: '0.05em',
										right: '0.05em',
										bottom: '-0.08em',
										height: '0.07em',
										borderRadius: '0.04em',
										backgroundColor: em?.color ?? t.activeColor,
										transformOrigin: direction === 'rtl' ? 'right center' : 'left center',
										transform: `scaleX(${isActive ? sweep : 0})`,
									}}
								/>
							</span>
						</Fragment>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
