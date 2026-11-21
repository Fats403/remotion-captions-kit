---
name: remotion-captions-kit
description: Add animated word-by-word captions or subtitles to a Remotion video with remotion-captions-kit. Use when a Remotion composition needs captions from word timings (Whisper, ElevenLabs, Deepgram, AssemblyAI, a TTS aligner) or an SRT file, a short-form caption look (the Hormozi or CapCut highlight, karaoke, one word at a time, a highlight box), captions in another language or script, a custom caption style, or SRT and VTT subtitle files from the same timings.
---

# Captions with remotion-captions-kit

This skill covers version 1.x. Check `package.json`; on 0.x, upgrade with
`npm i remotion-captions-kit@latest`, because `edgeOffset`, spacing and
measured pages changed in 1.0. The peer dependencies are `remotion`,
`@remotion/captions` and `react`, which any Remotion v4 project has.

## The usual case is one line

```tsx
import {AbsoluteFill, Sequence} from "remotion";
import {Captions} from "remotion-captions-kit";
import {loadFont} from "@remotion/google-fonts/Montserrat";

const {fontFamily} = loadFont("normal", {weights: ["900"], subsets: ["latin"]});

// {word, start, end} in seconds, from the transcript or voiceover alignment
const WORDS = [
  {word: "Most", start: 0.12, end: 0.38},
  {word: "kitchens", start: 0.38, end: 0.9},
  // …
];

export const MyVideo = () => (
  <AbsoluteFill>
    {/* footage, music, graphics… */}
    <Sequence from={15}>
      {/* the voiceover's <Audio> */}
      <Captions words={WORDS} preset="PopHighlight" theme={{fontFamily, safeArea: "tiktok"}} />
    </Sequence>
  </AbsoluteFill>
);
```

That pages the words where a person would break them, never across a
sentence end or a pause. It measures each page in the font to at most two
lines and shrinks a page whose longest word won't fit. Then it animates
each page in the preset. Don't rebuild any of that with
`createTikTokStyleCaptions` when the kit is installed.

Things that decide whether it works:

- **Timing is relative to where `<Captions>` mounts.** Word times count
  from the start of the enclosing `<Sequence>`, so put the captions in the
  voiceover's Sequence, as above, or shift the timings yourself. Mounted
  at the composition's root, they count from frame 0. A
  Sequence's default layout is fine. If that Sequence has a
  `durationInFrames`, make it last past the final word, or the last page
  is cut off.
- **Render it last** inside the composition so it sits on top. It fills
  its parent, so a parent smaller than the frame (one half of a split
  screen) places and measures the captions inside that half.
- **Pass words as the transcriber gave them.** Leading spaces, bare words,
  Chinese or Japanese words with no spaces, and Arabic in reading order
  all work as given. Don't add spaces, strip punctuation or reverse
  anything. There's no language setting: the kit reads the script from
  the text. Milliseconds need `timeUnit="milliseconds"`.
- **Already have `Caption[]`** in `@remotion/captions`' shape, from Whisper
  or `parseSrt()`? Pass `captions={...}` instead of `words`. For SRT,
  run `splitCaptionsIntoWords({captions})` first so word-level styles get
  per-word timing, estimated from each word's length.

## The presets

Pick the look that fits the video, not the first one listed.

| Preset | Look | Pages |
| --- | --- | --- |
| `PopHighlight` | Heavy outlined capitals, spoken word in color (yellow by default). The short-form default, the "Hormozi" look | up to 3 words |
| `HighlightBox` | Bold capitals, a block of color behind the spoken word (violet by default) | up to 3 words |
| `Bounce` | Outlined capitals bouncing in at a tilt, spoken word in color. Loud and playful | up to 2 words |
| `OneWord` | One big outlined word at a time. Hooks and fast, punchy lines | 1 word |
| `PopIn` | Clean sentence case, each word fades and rises in. Calm explainers | 2 lines |
| `KaraokeFill` | Color sweeps through each word as it's said. Lyrics, read-alongs | 2 lines |
| `KineticSlam` | Capitals slam in one by one with overshoot | 2 lines |
| `PillKaraoke` | The line in a rounded light pill, words darken as spoken. Podcasts, interviews | 2 lines |
| `WeightShift` | Minimal, the spoken word goes bold | 2 lines |
| `NeonGlow` | The spoken word glows and keeps an afterglow. Dark footage | 2 lines |
| `EditorialEmphasis` | The line rises in and an underline follows the spoken word. Editorial, documentary | 2 lines |

The Pages column is each preset's own pacing, and a component of your own
gets the "2 lines" pacing. Every page also ends at a sentence end or a
pause, and holds at most 1.2 seconds of speech. "2 lines" means two lines
as measured in your font.

To change the pacing, pass `pagination`. Each option replaces only its own
setting and leaves the rest of the preset's pacing alone:

```tsx
<Captions words={WORDS} preset="PopIn" pagination={{maxDurationMs: 2500}} />
```

| Option | Default | |
| --- | --- | --- |
| `maxDurationMs` | 1200 | Longest stretch of speech on one page. Raise it (2000 to 3000) for calm, longer reads |
| `maxWordsPerPage` | the preset's own, else none | |
| `maxLines` | 2 | Measured lines a page may wrap into |
| `minWordsPerPage` | 2 (`OneWord`: 1) | Shorter pages borrow a word from a neighbour. 1 allows single words |
| `silenceGapMs` | 400 | A pause this long always ends a page |
| `minDurationMs` | 300 | Pages shorter than this merge with a neighbour |

Japanese and Chinese speech packs few characters into 1.2 seconds, so in a
calm or landscape video raise `maxDurationMs` there too, or pages come out
four or five characters long.

## Theme

Every field is optional. Defaults in the comments:

```ts
theme={{
  fontFamily,                       // default: the system UI font
  fontSize: 80,                     // px at the composition's resolution; default 72
  textColor: "#ffffff",             // default #ffffff (PillKaraoke: #1e1e20)
  activeColor: "#ffd400",           // default #4ade80, or the preset's own
  pillColor: "#ececee",             // PillKaraoke only
  position: "bottom",               // "top" | "center" | "bottom"; default "bottom"
  safeArea: "tiktok",               // "tiktok" | "reels" | "shorts", or "all" for every one; vertical only.
                                    // Sets edgeOffset and the side padding; either can still be set by hand
  edgeOffset: 0.12,                 // fraction of the HEIGHT from that edge; default 0.1, 0 at "center"
  maxWidth: 0.65,                   // widest the text block may be, fraction of the width; default 1
  fontWeight: 800, uppercase: true, // over the preset's own
  strokeWidth: 4, strokeColor: "#000", // outline in px, drawn behind the letters; color default black
}}
```

The traps:

- **`PillKaraoke`'s `textColor` is the ink on its light pill**, dark by
  default. A white `textColor` makes the words invisible. To go light on
  dark, set `pillColor` dark too.
- **`activeColor` does nothing in `KineticSlam`, `OneWord`, `PopIn`,
  `WeightShift` and `PillKaraoke`.** For a brand color there, set
  `textColor` to color every word, or use `emphasis` for a few.
- **Vertical video (1080x1920):** `fontSize` 64 to 110, more in a
  condensed font like Anton or Bebas Neue. Use `position: "bottom"` with
  the platform's `safeArea`, or `"center"` for a hook, where `safeArea`
  only keeps the sides clear. Without `safeArea`, a bottom caption sits
  under the platform's caption text and buttons. Leave `maxWidth` at 1;
  the safe area's side padding already narrows the block.
- **Landscape video (1920x1080):** `fontSize` 48 to 64,
  `position: "bottom"`, `edgeOffset` 0.08 to 0.1 and `maxWidth: 0.65` so
  lines stay short enough to read. Leave out `safeArea`, which is for
  vertical platforms.
- Long words shrink on their own, so don't shrink the whole track for one
  URL.

## Fonts

Load the font with `@remotion/google-fonts` or `@remotion/fonts` and pass
its family in the theme. Load the weight the preset draws in: 900 for
`PopHighlight`, `Bounce`, `OneWord` and `KineticSlam`; 800 for
`HighlightBox`, `KaraokeFill`, `PillKaraoke` and `NeonGlow`; 700 for `PopIn`;
600 for `WeightShift` and `EditorialEmphasis`. `WeightShift` draws its bold
with an outline, so 600 is all it needs. Set `fontWeight` in the theme and
you load that weight instead. A font with one weight, like Anton or Bebas
Neue (400), needs `fontWeight: 400` in the theme, or the browser fakes a
bold.

Google Fonts subsets: `latin` covers English and Western European accents
(Spanish ñ, French, German). Add `latin-ext` for Polish, Czech, Turkish or
Romanian, and `cyrillic`, `greek` or `vietnamese` where needed.

Most display fonts cover Latin only. For other scripts, load a font that
covers them and list it after the display font, or use it alone when the
video has no Latin text. Noto Sans has one for each, with the subset to
ask for:

| Script | Font | Subset |
| --- | --- | --- |
| Arabic | `NotoSansArabic` | `arabic` |
| Hebrew | `NotoSansHebrew` | `hebrew` |
| Hindi, Marathi | `NotoSansDevanagari` | `devanagari` |
| Thai | `NotoSansThai` | `thai` |
| Japanese | `NotoSansJP` | `japanese` |
| Chinese | `NotoSansSC` | `chinese-simplified` |
| Korean | `NotoSansKR` | `korean` |

Google splits the Chinese, Japanese and Korean families into many small
files, and asking for the script's subset loads all of them:

```tsx
import {loadFont as loadJp} from "@remotion/google-fonts/NotoSansJP";

const {fontFamily: notoJp} = loadJp("normal", {weights: ["700"], subsets: ["japanese"], ignoreTooManyRequestsWarning: true});
theme={{fontFamily: `${fontFamily}, ${notoJp}`}}
```

The kit holds each frame until the font has every character the captions
use, files split by character range included, and only then measures. Don't
add a `delayRender` of your own for it.

## Emphasis

Color or restyle chosen words. Matching ignores case and punctuation:

```tsx
<Captions
  words={WORDS}
  preset="KineticSlam"
  emphasis={[
    {words: ["free", "today"], color: "#ffd400"},
    {match: (token, i) => i === 0, style: {fontStyle: "italic"}},
  ]}
/>
```

Use it for the words the video is about, one or two a sentence at most.
Emphasis everywhere reads as noise.

## A style of your own

When no preset fits, write a component that takes `{page, theme}` and
pass it as `preset` along with its `layout`. Build it on the headless
hooks and it gets pagination, languages and auto-shrink:

```tsx
import {Fragment, type FC} from "react";
import {AbsoluteFill} from "remotion";
import type {TikTokPage} from "@remotion/captions";
import {placementStyle, typeStyle, useFitTheme, useTokenStates, type PresetLayout, type PresetProps} from "remotion-captions-kit";

const LAYOUT: PresetLayout = {fontWeight: 800, uppercase: true};

export const Reveal: FC<PresetProps & {page: TikTokPage}> = ({page, theme}) => {
  const t = useFitTheme({page, theme, layout: LAYOUT});
  const {tokens, direction} = useTokenStates({page});
  return (
    <AbsoluteFill style={placementStyle(t)}>
      <div style={{direction, fontFamily: t.fontFamily, fontSize: t.fontSize, ...typeStyle(t, LAYOUT), color: t.textColor, textAlign: "center"}}>
        {tokens.map(({token, text, space, isActive, hasAppeared, progress}) => (
          <Fragment key={token.fromMs}>
            {space}
            <span style={{position: "relative", opacity: hasAppeared ? 1 : 0, color: isActive ? t.activeColor : undefined}}>
              {text}
              {/* an underline that draws across the word as it's said */}
              <span style={{position: "absolute", left: 0, right: 0, bottom: "-0.05em", height: "0.08em", background: t.activeColor, transformOrigin: direction === "rtl" ? "right" : "left", transform: `scaleX(${isActive ? progress : 0})`}} />
            </span>
          </Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

<Captions words={WORDS} preset={Reveal} layout={LAYOUT} />
```

What you get:

- `useFitTheme({page, theme, layout})` returns the theme with every
  default filled in and `fontSize` brought down if a word won't fit.
- `typeStyle(t, layout)` sets the weight, capitals (CSS `text-transform`)
  and the theme's outline. `placementStyle(t)` positions the block.
- Each of `useTokenStates`' `tokens` has `text` (the word as written, no
  leading space, before capitals), `space` (what goes before it),
  `isActive` (being said now), `hasAppeared` (said or being said),
  `progress` (0 before the word, 0 to 1 while it's said, 1 after),
  `index`, and `token.fromMs` / `token.toMs` in absolute milliseconds. The
  hook already turns the Sequence's local frame into the page's time.
- `PresetLayout` tells the measurer how the style sets type: `fontWeight`,
  `uppercase`, `fontScale` (a multiple of `fontSize`) and `chromeEm` (width
  of padding or boxes around the words, in em).

Keep these or other scripts break:

- Render `space` between the word spans, never inside one. It's where
  lines wrap, and it's empty between Chinese, Japanese or Thai words.
- Set `direction` on the line so Arabic and Hebrew read from the right,
  and start sweeps and underlines from the right there too.
- Don't change a word's width as it animates, through letter spacing,
  font weight or added letters. Lines would re-wrap mid-page. Scale with
  `transform`, or keep letters not yet shown in place at `opacity: 0`.
- For effects letter by letter, split `text` with
  `new Intl.Segmenter(undefined, {granularity: "grapheme"})`, not
  `Array.from` or `split("")`. A Hindi, Thai or emoji letter can be
  several code points.

## Subtitle files

For a platform that takes a caption file beside the video (YouTube, a
player's CC button). Subtitles read better in longer cues than animated
captions, so page them for the file, one standard line of up to 42
characters held for up to 7 seconds:

```ts
import {captionsFromWords, createCaptionPages, pagesToSrt, pagesToVtt} from "remotion-captions-kit";

const {captions} = captionsFromWords({words: WORDS});  // timeUnit defaults to "seconds"
const {pages} = createCaptionPages({captions, maxDurationMs: 7000, maxCharsPerPage: 42});
const srt = pagesToSrt(pages);  // the whole file as a string
const vtt = pagesToVtt(pages);  // the same, with its WEBVTT header
```

A file runs on the video's clock. When the voiceover starts late, add its
offset to every word's `start` and `end` before `captionsFromWords`. Cues
still break at sentence ends and pauses, and Chinese, Japanese and Thai
cues come out without spaces between words. This runs in Node; it needs
no browser.

## Check the result

Render stills at frames where words are being said, such as
`npx remotion still <entry> <composition-id> out.png --frame=45`. Look
for four things. The caption should sit clear of the subject's face and
the platform's buttons. It should stay legible against the footage
underneath, or get an outline (`strokeWidth`) or a `PillKaraoke` pill.
It should be in the font you loaded. And the highlighted word should be
the one being said in the audio at that frame.
