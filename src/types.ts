import type {TikTokToken} from '@remotion/captions';
import type React from 'react';

/**
 * A single word with its spoken window. This is the shape speech pipelines
 * (Whisper, ElevenLabs, AssemblyAI) actually emit, pass it to
 * captionsFromWords() to get the Caption[] that @remotion/captions expects.
 */
export type WordTiming = {
	word: string;
	/** Start of the word, in the unit given to captionsFromWords() */
	start: number;
	/** End of the word, in the unit given to captionsFromWords() */
	end: number;
};

export type CaptionPosition = 'top' | 'center' | 'bottom';

/**
 * A platform whose buttons and text sit over the bottom and right of a
 * vertical video. Sets edgeOffset and paddingX to clear them; either can
 * still be set by hand.
 */
export type SafeArea = 'tiktok' | 'reels' | 'shorts' | 'all';

/**
 * One theme shared by every preset. A preset reads only the fields it needs;
 * unset fields fall back to the preset's own defaults.
 */
export type CaptionTheme = {
	fontFamily?: string;
	/** Font size in px, at the composition's native resolution. */
	fontSize?: number;
	/** Base color of not-yet-spoken / non-active words. */
	textColor?: string;
	/** Color of the currently spoken word (highlight, fill, glow…). */
	activeColor?: string;
	/** Background color for presets that draw a pill or box. */
	pillColor?: string;
	position?: CaptionPosition;
	/**
	 * Distance from the chosen edge as a fraction of composition height.
	 * At "center" it lifts the block above the middle by that fraction
	 * instead. Default 0.1 (0 at "center"), or the safe area's.
	 *
	 * Before 1.0 this was applied as CSS padding, which measures against the
	 * composition's width, so 0.18 on a 1080x1920 frame left 194px, not 346.
	 */
	edgeOffset?: number;
	/** Clears a platform's interface; see SafeArea. */
	safeArea?: SafeArea;
	/**
	 * Horizontal padding as a fraction of composition width. Default 0.06.
	 */
	paddingX?: number;
	/**
	 * Max width of the caption block as a fraction of composition width.
	 * Default 1 (padding only). ~0.65 reads better on wide compositions.
	 */
	maxWidth?: number;
	/** Overrides the preset's own weight. */
	fontWeight?: number;
	/** Set every word in capitals. */
	uppercase?: boolean;
	/**
	 * An outline drawn behind the letters, so it never eats into them, in
	 * px. Presets that outline by default take theirs when unset; 0 turns
	 * it off.
	 */
	strokeWidth?: number;
	/** Outline color. Default black. */
	strokeColor?: string;
};

/**
 * Marks certain words for special treatment (color, weight, style).
 * TikTokToken is a closed type, so emphasis can't travel through
 * createTikTokStyleCaptions() as token fields, instead presets resolve
 * these rules against each token at render time.
 */
export type EmphasisRule = {
	/** Case-insensitive match on the token's text (punctuation ignored). */
	words?: string[];
	/** Arbitrary predicate; index is the token's position in its page. */
	match?: (token: TikTokToken, index: number) => boolean;
	color?: string;
	style?: React.CSSProperties;
};

/** Common props every preset accepts. */
export type PresetProps = {
	theme?: CaptionTheme;
	emphasis?: EmphasisRule[];
};
