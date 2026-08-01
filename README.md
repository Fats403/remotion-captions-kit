# remotion-captions-kit

Animated caption presets and headless caption primitives for
[Remotion](https://remotion.dev), built on top of
[`@remotion/captions`](https://www.remotion.dev/docs/captions/).

I built this making videos for [videoventure.ai](https://videoventure.ai)
after hitting the same two walls over and over: pages split purely by time,
so you'd get lines like "the blank page. This" welded across a sentence
boundary, and there just weren't enough caption styles to offer people.
`@remotion/captions` handles parsing and stops there. This kit is
everything after that: pagination that breaks where a person would, the
timing math every caption style needs, and ready-made animated styles like
the ones short-form editors ship built in.

![All six presets](https://raw.githubusercontent.com/Fats403/remotion-captions-kit/main/assets/showcase.jpg)

## Presets

| Preset | Look |
| --- | --- |
| `KaraokeFill` | Color sweeps left-to-right through the active word |
| `KineticSlam` | Bold uppercase words slam in one by one with overshoot |
| `PillKaraoke` | The line sits in a rounded pill; words darken as spoken |
| `WeightShift` | Minimal: the active word carries the weight, the rest sit back |
| `NeonGlow` | The active word ignites; spoken words keep an afterglow |
| `EditorialEmphasis` | The line rises in as one piece; an underline sweeps the active word |

## Install

```bash
npm i remotion-captions-kit
```

`remotion`, `@remotion/captions`, and `react` are peer dependencies; any
Remotion v4 project already has them.

## Quick start

```tsx
import {
  captionsFromWords,
  useCaptionPages,
  CaptionTrack,
  KineticSlam,
} from "remotion-captions-kit";

// Word timings from Whisper, ElevenLabs, AssemblyAI, …
const WORDS = [
  {word: "every", start: 0.25, end: 0.55},
  {word: "great", start: 0.55, end: 0.9},
  {word: "video", start: 0.9, end: 1.35},
  // …
];

export const MyVideo = () => {
  const {captions} = captionsFromWords({words: WORDS});
  const {pages} = useCaptionPages({captions, maxDurationMs: 1200});

  return (
    <CaptionTrack pages={pages}>
      {(page) => (
        <KineticSlam
          page={page}
          theme={{activeColor: "#FFD400", position: "bottom"}}
          emphasis={[{words: ["video"], color: "#FFD400"}]}
        />
      )}
    </CaptionTrack>
  );
};
```

Already using `createTikTokStyleCaptions()`? Every preset takes its
`TikTokPage` directly, skip `captionsFromWords` and pass your pages in.

## Pagination that respects sentences

The stock `createTikTokStyleCaptions()` groups words purely by time
window, so a page can read `"the blank page. This"`, welding a sentence
end to the start of the next one, straight across a pause. This kit's
`createCaptionPages()` (what `useCaptionPages` uses) breaks pages the way
a person would:

- after sentence-ending punctuation (`.` `!` `?` `…`)
- at silences of `silenceGapMs` or longer (default 400ms)
- before a word that would push the page past `maxDurationMs`

It emits the same `TikTokPage` shape, so it drops into anything built on
`@remotion/captions`.

## Emphasis: per-word color and style

Every preset accepts `emphasis` rules that match words and restyle them:

```tsx
emphasis={[
  {words: ["profit", "free"], color: "#FFD400"},
  {match: (token, i) => i === 0, style: {fontStyle: "italic"}},
]}
```

Matching is case-insensitive and ignores punctuation, so `"start"` matches
the token `" start."`.

![Emphasis rules](https://raw.githubusercontent.com/Fats403/remotion-captions-kit/main/assets/emphasis.jpg)

## Theming

All presets share one `CaptionTheme`; each reads the fields it needs:

```ts
type CaptionTheme = {
  fontFamily?: string;
  fontSize?: number;      // px at your composition's resolution
  textColor?: string;     // base/non-active words
  activeColor?: string;   // highlight / fill / glow
  pillColor?: string;     // pill & box backgrounds
  position?: "top" | "center" | "bottom";
  edgeOffset?: number;    // fraction of height from the chosen edge
  paddingX?: number;      // horizontal padding, fraction of width
  maxWidth?: number;      // caption block cap, fraction of width
};
```

All placement values are fractions of the composition, so one theme works
at every resolution. To clear TikTok/Reels UI chrome, raise `edgeOffset`
to ~0.18. On wide compositions, `maxWidth: 0.65` keeps lines readable:

```ts
const theme = {position: "bottom", edgeOffset: 0.18, maxWidth: 0.65};
```

## Rolling your own style

The headless layer is exported, so a custom style is ~30 lines:

```tsx
import {useTokenStates, placementStyle, resolveTheme} from "remotion-captions-kit";

const MyStyle = ({page}) => {
  const {tokens} = useTokenStates({page}); // isActive, hasAppeared, progress per word
  // render spans however you like
};
```

`useTokenStates` does the absolute-vs-relative time conversion for you,
the classic source of captions lighting up early or late.

## SRT files

SRT works too. Cues carry no word timing, so `splitCaptionsIntoWords()`
distributes each cue's duration across its words by length. Close enough
that word-level styles read correctly:

```tsx
import {parseSrt} from "@remotion/captions";
import {splitCaptionsIntoWords, useCaptionPages} from "remotion-captions-kit";

const {captions} = parseSrt({input: srtFileContents});
const {captions: words} = splitCaptionsIntoWords({captions});
const {pages} = useCaptionPages({captions: words});
```

Prefer page-level styles for SRT (`PillKaraoke`, `EditorialEmphasis`) if
the approximation bothers you; they only depend on cue timing.

## Demo & tests

```bash
pnpm install
pnpm studio   # Remotion Studio with all six presets on sample timings
pnpm test     # vitest suite for pagination, SRT splitting, emphasis
```

## License

MIT
