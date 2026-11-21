export {captionsFromWords} from './captions-from-words';
export type {
	CaptionsFromWordsInput,
	CaptionsFromWordsOutput,
} from './captions-from-words';
export {CaptionTrack} from './caption-track';
export {Captions} from './captions';
export type {CaptionsProps} from './captions';
export type {CaptionTrackProps} from './caption-track';
export {createCaptionPages} from './create-caption-pages';
export type {
	CreateCaptionPagesInput,
	CreateCaptionPagesOutput,
} from './create-caption-pages';
export {resolveEmphasis} from './emphasis';
export {textDirection, textWidth, tokenSpacing} from './scripts';
export {fitScale, useFitTheme} from './fit';
export {LAYOUTS} from './layouts';
export {normalizeCaptions} from './normalize-captions';
export type {NormalizedWord} from './normalize-captions';
export {endsClause, endsSentence} from './sentence-boundaries';
export {splitCaptionsIntoWords} from './split-captions-into-words';
export type {
	SplitCaptionsIntoWordsInput,
	SplitCaptionsIntoWordsOutput,
} from './split-captions-into-words';
export {defaultTheme, placementStyle, resolveTheme, SAFE_AREAS, typeStyle} from './theme';
export {pagesToSrt, pagesToVtt} from './subtitles';
export {PRESETS} from './presets';
export type {PresetComponent, PresetEntry, PresetLayout, PresetName} from './presets';
export type {ResolvedTheme} from './theme';
export type {
	CaptionPosition,
	CaptionTheme,
	EmphasisRule,
	PresetProps,
	SafeArea,
	WordTiming,
} from './types';
export {useCaptionPages} from './use-caption-pages';
export type {UseCaptionPagesInput} from './use-caption-pages';
export {useCaptionTimeMs, useTokenStates} from './use-token-states';
export type {TokenState} from './use-token-states';

export {EditorialEmphasis} from './presets/editorial-emphasis';
export {KaraokeFill} from './presets/karaoke-fill';
export {KineticSlam} from './presets/kinetic-slam';
export {NeonGlow} from './presets/neon-glow';
export {PillKaraoke} from './presets/pill-karaoke';
export {WeightShift} from './presets/weight-shift';
export {Bounce} from './presets/bounce';
export {HighlightBox} from './presets/highlight-box';
export {OneWord} from './presets/one-word';
export {PopHighlight} from './presets/pop-highlight';
export {PopIn} from './presets/pop-in';
