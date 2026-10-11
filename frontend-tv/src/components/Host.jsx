import React, { memo, useEffect, useRef, useState } from 'react';
import useHostCommentary from '../hooks/useHostCommentary';
import { HOST_NAME } from '../hostLines';
import '../host.css';

// mouth shape per emotion; "stroke" shapes switch to an open mouth while talking
const MOUTH_BY_EMOTION = {
  idle: 'smile',
  happy: 'open',
  shock: 'o',
  think: 'side',
  laugh: 'grin',
  sad: 'frown',
  dance: 'open'
};
const STROKE_MOUTHS = new Set(['smile', 'side', 'frown']);
// mouth while the host is NOT talking (talking always wins – the lips keep moving)
const MOUTH_BY_ACTION = { sleep: 'snore', 'm-stretch': 'yawn', boom: 'o', wake: 'o' };

// How each animation uses the figure: r = replaces the default right arm, l = takes the mic
// hand (the "mic to the mouth" pose is skipped), wide = shrink the figure a bit so gloves and
// props stay inside the host strip.
const ACT_META = {
  wave: { r: 1, wide: 1 },
  point: { r: 1, wide: 1 },
  watch: { r: 1, wide: 1 },
  drumroll: { r: 1, l: 1, wide: 1 },
  flip: { wide: 2 },
  boom: { wide: 1 },
  zero: { r: 1, wide: 1 },
  confetti: { wide: 2 },
  wink: { r: 1, wide: 1 },
  wake: {},
  sleep: {},
  bounce: {},
  popcorn: { r: 1 },
  dance0: { l: 1, wide: 2 },
  dance1: { l: 1, wide: 1 },
  dance2: { l: 1, wide: 2 },
  'm-glasses': { r: 1 },
  'm-stache': { r: 1 },
  'm-look': {},
  'm-stretch': { l: 1, wide: 2 }
};
const WIDE_EMOTIONS = new Set(['shock', 'dance']);

function Mouth({ shape }) {
  switch (shape) {
    case 'open':
      return (
        <g>
          <path className="h-mouth-hole" d="M84 150 Q100 174 116 150 Q100 156 84 150 Z" />
          <ellipse className="h-tongue" cx="100" cy="163" rx="8" ry="4.5" />
        </g>
      );
    case 'grin':
      return (
        <g>
          <path className="h-mouth-hole" d="M78 148 Q100 186 122 148 Q100 155 78 148 Z" />
          <path className="h-teeth" d="M83 150 Q100 155 117 150 L116 155 Q100 159 84 155 Z" />
          <ellipse className="h-tongue" cx="100" cy="170" rx="11" ry="6" />
        </g>
      );
    case 'o':
      return <ellipse className="h-mouth-hole" cx="100" cy="159" rx="7.5" ry="10" />;
    case 'snore':
      return <ellipse className="h-mouth-hole" cx="100" cy="157" rx="4.5" ry="3.5" />;
    case 'yawn':
      return (
        <g>
          <ellipse className="h-mouth-hole" cx="100" cy="161" rx="10" ry="13" />
          <ellipse className="h-tongue" cx="100" cy="169" rx="6" ry="3.5" />
        </g>
      );
    case 'frown':
      return <path className="h-mouth-line" d="M87 163 Q100 151 113 163" />;
    case 'side':
      return <path className="h-mouth-line" d="M90 159 Q101 154 113 156" />;
    case 'smile':
    default:
      return <path className="h-mouth-line" d="M85 152 Q100 166 115 152" />;
  }
}

/** White cartoon glove: fist (default), open hand, pointing finger or thumb up. Fingers point "up" (-y). */
function Glove({ x, y, rot = 0, kind = 'fist', r = 11 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {kind === 'open' && (
        <>
          <ellipse className="h-glove" cx="-7.4" cy="-10" rx="3.4" ry="6.6" transform="rotate(-34 -7.4 -10)" />
          <ellipse className="h-glove" cx="-2.6" cy="-12" rx="3.4" ry="7" transform="rotate(-11 -2.6 -12)" />
          <ellipse className="h-glove" cx="2.6" cy="-12" rx="3.4" ry="7" transform="rotate(11 2.6 -12)" />
          <ellipse className="h-glove" cx="7.4" cy="-10" rx="3.4" ry="6.6" transform="rotate(34 7.4 -10)" />
          <ellipse className="h-glove" cx="-10.5" cy="1" rx="3.4" ry="6" transform="rotate(-62 -10.5 1)" />
        </>
      )}
      {kind === 'point' && <rect className="h-glove" x="-3.8" y={-r - 15} width="7.6" height="21" rx="3.8" />}
      {kind === 'thumb' && <rect className="h-glove" x="-4" y="-23" width="8" height="16" rx="4" />}
      <circle r={r} className="h-glove" />
      {(kind === 'thumb' || kind === 'point') && (
        <path className="h-knuckles" d={`M${-r * 0.55} ${r * 0.05} h${r * 1.1} M${-r * 0.5} ${r * 0.45} h${r}`} />
      )}
    </g>
  );
}

// confetti pieces: burst offset (dx, dy), fall distance (fy), spin (r), colour index
const CONFETTI = [
  { dx: -74, dy: -30, fy: 80, r: 260, c: 0 }, { dx: -52, dy: -44, fy: 120, r: -200, c: 1 },
  { dx: -30, dy: -52, fy: 95, r: 320, c: 2 }, { dx: -10, dy: -58, fy: 135, r: -280, c: 3 },
  { dx: 12, dy: -56, fy: 105, r: 240, c: 4 }, { dx: 34, dy: -52, fy: 130, r: -300, c: 0 },
  { dx: 56, dy: -42, fy: 90, r: 220, c: 1 }, { dx: 74, dy: -28, fy: 120, r: -260, c: 2 },
  { dx: -62, dy: -14, fy: 145, r: 180, c: 3 }, { dx: 62, dy: -12, fy: 150, r: -180, c: 4 }
];
const CONFETTI_COLORS = ['#FFD23F', '#FF3EA5', '#3EF0FF', '#7CFF6B', '#FFFFFF'];

/** Prof. Pytajek – an original round quiz-show host drawn as inline SVG. */
const HostFigure = memo(function HostFigure({ emotion, talking, mouthRef, action }) {
  let shape = MOUTH_BY_EMOTION[emotion] || 'smile';
  if (talking && STROKE_MOUTHS.has(shape)) shape = emotion === 'sad' ? 'o' : 'open';
  if (!talking && MOUTH_BY_ACTION[action]) shape = MOUTH_BY_ACTION[action];

  return (
    <svg className="host-svg" viewBox="0 0 200 240" aria-hidden="true">
      <defs>
        <radialGradient id="hb-body" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFD08A" />
          <stop offset="55%" stopColor="#FF9450" />
          <stop offset="100%" stopColor="#D9512C" />
        </radialGradient>
        <radialGradient id="hb-mic" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="60%" stopColor="#B9C2EA" />
          <stop offset="100%" stopColor="#6B76A8" />
        </radialGradient>
        <linearGradient id="hb-bow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF5DB8" />
          <stop offset="100%" stopColor="#C81E7A" />
        </linearGradient>
        <linearGradient id="hb-lens" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E3F4FF" />
        </linearGradient>
      </defs>

      {/* layers: fit (shrinks for wide poses) > stage (looping phase animation) >
          act (one-shot jumps/shakes) > root (emotion) – each owns its own transform */}
      <g className="h-fit">
        <ellipse className="h-shadow" cx="100" cy="226" rx="54" ry="7" />

        <g className="h-stage">
          <g className="h-act">
            <g className="h-root">
              {/* feet */}
              <g className="h-feet">
                <g className="h-foot h-foot-l">
                  <rect x="80" y="188" width="8" height="18" rx="4" className="h-leg" />
                  <ellipse cx="78" cy="211" rx="17" ry="9" className="h-shoe" />
                  <ellipse cx="73" cy="207" rx="6" ry="2.5" className="h-shoe-shine" />
                </g>
                <g className="h-foot h-foot-r">
                  <rect x="112" y="188" width="8" height="18" rx="4" className="h-leg" />
                  <ellipse cx="122" cy="211" rx="17" ry="9" className="h-shoe" />
                  <ellipse cx="117" cy="207" rx="6" ry="2.5" className="h-shoe-shine" />
                </g>
              </g>

              {/* body = head: a round professor */}
              <g className="h-body">
                <circle cx="100" cy="124" r="72" fill="url(#hb-body)" className="h-ball" />
                <ellipse cx="74" cy="84" rx="26" ry="15" className="h-sheen" transform="rotate(-28 74 84)" />

                {/* fluffy side hair */}
                <g className="h-tuft">
                  <circle cx="33" cy="96" r="11" /><circle cx="27" cy="108" r="10" /><circle cx="38" cy="86" r="8" />
                  <circle cx="167" cy="96" r="11" /><circle cx="173" cy="108" r="10" /><circle cx="162" cy="86" r="8" />
                </g>
                {/* the question-mark curl */}
                <path className="h-curl" d="M98 54 C 92 40, 96 26, 110 24 C 124 22, 132 34, 126 43 C 121 50, 112 48, 112 41" />

                {/* brows */}
                <rect className="h-brow h-brow-l" x="61" y="79" width="28" height="7.5" rx="3.75" />
                <rect className="h-brow h-brow-r" x="111" y="79" width="28" height="7.5" rx="3.75" />

                {/* sabotage: soot all over the face and the hair */}
                <g className="h-x h-x-soot">
                  <ellipse cx="100" cy="134" rx="44" ry="25" />
                  <ellipse cx="66" cy="94" rx="21" ry="12" />
                  <ellipse cx="136" cy="96" rx="19" ry="11" />
                  <ellipse cx="52" cy="140" rx="12" ry="8" />
                  <ellipse cx="148" cy="136" rx="11" ry="8" />
                  <circle cx="30" cy="100" r="11" /><circle cx="36" cy="86" r="7" />
                  <circle cx="169" cy="101" r="10" /><circle cx="163" cy="87" r="7" />
                </g>

                {/* glasses: lenses, eyes, rims */}
                <g className="h-glasses">
                  <line className="h-temple" x1="57" y1="108" x2="36" y2="103" />
                  <line className="h-temple" x1="143" y1="108" x2="164" y2="103" />
                  <circle cx="75" cy="112" r="18" fill="url(#hb-lens)" />
                  <circle cx="125" cy="112" r="18" fill="url(#hb-lens)" />
                  <g className="h-pupils">
                    <g className="h-pupil h-pupil-l">
                      <circle cx="77" cy="114" r="7" className="h-iris" />
                      <circle cx="79.5" cy="111" r="2.2" className="h-glint" />
                    </g>
                    <g className="h-pupil h-pupil-r">
                      <circle cx="123" cy="114" r="7" className="h-iris" />
                      <circle cx="125.5" cy="111" r="2.2" className="h-glint" />
                    </g>
                  </g>
                  <g className="h-happy-eyes">
                    <path d="M65 117 Q75 104 85 117" />
                    <path d="M115 117 Q125 104 135 117" />
                  </g>
                  <g className="h-x h-x-sleep-eyes">
                    <path d="M64 112 Q75 121 86 112" />
                    <path d="M114 112 Q125 121 136 112" />
                  </g>
                  <path className="h-x h-x-wink-eye" d="M64 115 Q75 106 86 115" />
                  <circle cx="75" cy="112" r="18" className="h-rim" />
                  <circle cx="125" cy="112" r="18" className="h-rim" />
                  <path className="h-rim" d="M93 109 Q100 104 107 109" />
                  <circle cx="68" cy="105" r="3" className="h-lens-glare" />
                  <circle cx="118" cy="105" r="3" className="h-lens-glare" />
                </g>

                <path className="h-tear" d="M70 130 Q66 138 70 141 Q74 138 70 130 Z" />

                {/* cheeks, nose, moustache, mouth */}
                <ellipse cx="56" cy="140" rx="10" ry="6" className="h-cheek h-cheek-l" />
                <ellipse cx="144" cy="140" rx="10" ry="6" className="h-cheek h-cheek-r" />
                <g className="h-mouth" ref={mouthRef}>
                  <g className="h-mouth-inner">
                    <Mouth shape={shape} />
                  </g>
                </g>
                <g className="h-stache">
                  <path d="M100 141 C 92 132, 76 133, 70 144 C 79 140, 89 149, 100 145 C 111 149, 121 140, 130 144 C 124 133, 108 132, 100 141 Z" />
                </g>
                <ellipse cx="100" cy="131" rx="8.5" ry="6.5" className="h-nose" />
                <ellipse cx="97" cy="129" rx="3" ry="1.8" className="h-nose-shine" />
                <circle className="h-x h-x-snot" cx="112" cy="137" r="6.5" />

                {/* bow tie */}
                <g className="h-bow">
                  <path d="M100 188 L78 177 Q74 188 78 199 Z" fill="url(#hb-bow)" />
                  <path d="M100 188 L122 177 Q126 188 122 199 Z" fill="url(#hb-bow)" />
                  <rect x="94" y="182" width="12" height="12" rx="3.5" className="h-bow-knot" />
                  <circle cx="85" cy="184" r="1.8" className="h-bow-dot" />
                  <circle cx="84" cy="193" r="1.8" className="h-bow-dot" />
                  <circle cx="115" cy="184" r="1.8" className="h-bow-dot" />
                  <circle cx="116" cy="193" r="1.8" className="h-bow-dot" />
                </g>

                <path className="h-sweat" d="M158 66 Q151 78 157 83 Q164 79 158 66 Z" />
              </g>

              {/* right arm (gestures) */}
              <g className="h-arm h-arm-r">
                <path d="M163 142 Q178 166 184 190" className="h-sleeve" />
                <circle cx="185" cy="194" r="11" className="h-glove" />
              </g>

              {/* left arm with the microphone: down pose and "mic to mouth" pose */}
              <g className="h-arm h-arm-l h-arm-l-down">
                <path d="M37 142 Q22 166 16 190" className="h-sleeve" />
                <line x1="15" y1="194" x2="25" y2="170" className="h-mic-handle" />
                <circle cx="28" cy="163" r="10" fill="url(#hb-mic)" className="h-mic-head" />
                <path d="M20 160 H36 M19 165 H37" className="h-mic-grill" />
                <circle cx="15" cy="194" r="11" className="h-glove" />
              </g>
              <g className="h-arm-l-up">
                <path d="M37 142 Q12 172 48 178" className="h-sleeve" />
                <line x1="54" y1="176" x2="60" y2="156" className="h-mic-handle" />
                <circle cx="62" cy="149" r="10" fill="url(#hb-mic)" className="h-mic-head" />
                <path d="M54 146 H70 M53 151 H71" className="h-mic-grill" />
                <circle cx="54" cy="177" r="11" className="h-glove" />
              </g>

              {/* ---------- action arms & props (each shown only during its animation) ---------- */}
              {/* wave: open hand up high */}
              <g className="h-x h-x-wave">
                <g className="h-pop-r">
                  <g className="h-wave-arm">
                    <path d="M163 142 Q188 128 179 96" className="h-sleeve" />
                    <g className="h-wave-hand"><Glove x={178} y={88} rot={8} kind="open" /></g>
                  </g>
                </g>
              </g>
              {/* point at the question on the screen */}
              <g className="h-x h-x-point">
                <g className="h-pop-r">
                  <g className="h-point-arm">
                    <path d="M163 142 Q194 142 186 114" className="h-sleeve" />
                    <Glove x={185} y={108} rot={58} kind="point" />
                    <path className="h-point-rays" d="M207 84 l5 -5 M210 96 l7 0 M202 74 l2 -7" />
                  </g>
                </g>
              </g>
              {/* glance at the wristwatch */}
              <g className="h-x h-x-watch">
                <g className="h-pop-r">
                  <path d="M163 142 Q196 150 186 120" className="h-sleeve" />
                  <rect x="179" y="119" width="15" height="9" rx="2" className="h-watch-band" transform="rotate(-14 186 123)" />
                  <circle cx="189" cy="126" r="11" className="h-watch-face" />
                  <path className="h-watch-hour" d="M189 126 V119" />
                  <path className="h-watch-min" d="M189 126 L196 126" />
                  <Glove x={184} y={108} rot={-10} />
                </g>
              </g>
              {/* snare drum + sticks */}
              <g className="h-x h-x-drum">
                <rect x="64" y="199" width="72" height="20" rx="3" className="h-drum-shell" />
                <path d="M66 203 L76 215 L86 203 L96 215 L106 203 L116 215 L126 203 L134 213" className="h-drum-lace" />
                <ellipse cx="100" cy="219" rx="36" ry="5.5" className="h-drum-rim" />
                <ellipse cx="100" cy="199" rx="36" ry="7" className="h-drum-head" />
                <g className="h-drum-arm h-drum-arm-l">
                  <path d="M37 142 Q26 178 56 182" className="h-sleeve" />
                  <path d="M62 182 L86 196" className="h-stick" />
                  <circle cx="87" cy="196.5" r="3" className="h-stick-tip" />
                  <Glove x={60} y={181} r={10} />
                </g>
                <g className="h-drum-arm h-drum-arm-r">
                  <path d="M163 142 Q174 178 144 182" className="h-sleeve" />
                  <path d="M138 182 L114 196" className="h-stick" />
                  <circle cx="113" cy="196.5" r="3" className="h-stick-tip" />
                  <Glove x={140} y={181} r={10} />
                </g>
                <path className="h-drum-hits" d="M78 186 l-4 -6 M92 183 l0 -7 M108 183 l0 -7 M122 186 l4 -6" />
              </g>
              {/* "0 pkt" sign */}
              <g className="h-x h-x-zero">
                <g className="h-sign-up">
                  <g className="h-sign">
                    <path d="M163 142 Q190 134 178 102" className="h-sleeve" />
                    <path d="M176 98 L171 46" className="h-stick" />
                    <g transform="rotate(-6 160 30)">
                      <rect x="128" y="10" width="66" height="38" rx="6" className="h-sign-board" />
                      <text x="161" y="38" className="h-sign-text">0 pkt</text>
                    </g>
                    <Glove x={176} y={98} rot={-8} />
                  </g>
                </g>
              </g>
              {/* thumbs up */}
              <g className="h-x h-x-wink">
                <g className="h-pop-r">
                  <path d="M163 142 Q194 150 186 124" className="h-sleeve" />
                  <g className="h-thumb"><Glove x={185} y={118} kind="thumb" /></g>
                  <path className="h-ting" d="M162 80 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 Z" />
                </g>
              </g>
              {/* popcorn bucket – a kernel keeps popping straight into his mouth */}
              <g className="h-x h-x-popcorn">
                <path d="M163 142 Q184 176 162 182" className="h-sleeve" />
                <g className="h-kernels">
                  <circle cx="138" cy="148" r="5.5" /><circle cx="146" cy="143" r="6" /><circle cx="155" cy="145" r="6" />
                  <circle cx="163" cy="143" r="5.5" /><circle cx="168" cy="149" r="5" /><circle cx="150" cy="150" r="5" />
                  <circle cx="159" cy="151" r="5" />
                </g>
                <path d="M132 150 L172 150 L165 188 L139 188 Z" className="h-bucket-red" />
                <path d="M140 150 L148 150 L147.4 188 L144.2 188 Z M156 150 L164 150 L159.8 188 L156.6 188 Z" className="h-bucket-white" />
                <path d="M131 150 H173" className="h-bucket-rim" />
                <circle className="h-kernel-fly" cx="150" cy="142" r="4.5" />
                <Glove x={166} y={178} r={10} />
              </g>
              {/* micro-idles: push the glasses up / twirl the moustache */}
              <g className="h-x h-x-glasses">
                <g className="h-reach">
                  <path d="M163 142 Q158 114 124 108" className="h-sleeve" />
                  <Glove x={116} y={106} rot={-90} kind="point" r={9} />
                </g>
              </g>
              <g className="h-x h-x-stache">
                <g className="h-reach">
                  <path d="M163 142 Q172 166 146 155" className="h-sleeve" />
                  <g className="h-twirl"><Glove x={137} y={149} r={8} /></g>
                </g>
              </g>
              {/* top hat full of confetti */}
              <g className="h-x h-x-hat">
                <g className="h-hat">
                  <rect x="78" y="12" width="44" height="42" rx="3" className="h-hat-crown" />
                  <rect x="78" y="40" width="44" height="8" className="h-hat-band" />
                  <rect x="84" y="16" width="5" height="22" rx="2.5" className="h-hat-shine" />
                  <ellipse cx="100" cy="54" rx="32" ry="6.5" className="h-hat-brim" />
                </g>
                <g className="h-confetti">
                  {CONFETTI.map((p, i) => (
                    <rect
                      key={i}
                      x="97"
                      y="10"
                      width={i % 3 ? 5 : 6}
                      height={i % 3 ? 8 : 6}
                      rx={i % 3 ? 1 : 3}
                      fill={CONFETTI_COLORS[p.c]}
                      style={{ '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--fy': `${p.fy}px`, '--r': `${p.r}deg`, animationDelay: `${1.2 + (i % 4) * 0.07}s` }}
                    />
                  ))}
                </g>
              </g>
              {/* smoke rising from the singed hair */}
              <g className="h-x h-x-smoke">
                <circle cx="30" cy="86" r="9" /><circle cx="170" cy="86" r="9" />
                <circle cx="112" cy="28" r="8" /><circle cx="44" cy="72" r="7" /><circle cx="158" cy="72" r="7" />
              </g>
              {/* sleep: Zzz */}
              <g className="h-x h-x-zzz">
                <text x="146" y="64">z</text>
                <text x="146" y="64">Z</text>
                <text x="146" y="64">Z</text>
              </g>
              {/* startled awake */}
              <text className="h-x h-x-bang" x="158" y="50">!</text>

              {/* effects */}
              <g className="h-fx h-notes">
                <text x="12" y="40">♪</text>
                <text x="168" y="34">♫</text>
                <text x="182" y="80">♪</text>
              </g>
              <g className="h-fx h-sparkles">
                <path d="M22 50 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 Z" />
                <path d="M176 44 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 Z" />
              </g>
              <g className="h-fx h-think-dots">
                <circle cx="150" cy="44" r="4" />
                <circle cx="164" cy="30" r="6" />
                <circle cx="182" cy="14" r="8.5" />
              </g>
            </g>
          </g>
        </g>

        {/* explosion flash in front of everything */}
        <g className="h-x h-x-burst">
          <path className="h-burst-out" d="M100 22 L113 66 L152 44 L138 86 L184 94 L144 112 L178 146 L132 138 L130 184 L104 150 L74 190 L72 144 L24 156 L58 118 L16 94 L62 86 L46 42 L87 68 Z" />
          <path className="h-burst-in" d="M100 56 L109 84 L134 72 L124 97 L152 104 L124 116 L140 138 L113 131 L106 158 L93 134 L70 150 L76 124 L50 116 L76 102 L66 76 L90 88 Z" />
        </g>
      </g>
    </svg>
  );
});

const TYPE_MS = 28;

function Host({ settings, sound }) {
  const { bubble, emotion, speaking, entranceKey, subscribeFlap, action, ambient } = useHostCommentary({ settings, sound });
  const [typedState, setTyped] = useState({ id: null, n: 0 });
  const [shownBubble, setShownBubble] = useState(null); // keeps text during the exit animation
  const mouthRef = useRef(null);

  // typewriter reveal of the current line
  useEffect(() => {
    if (!bubble) return undefined;
    setShownBubble(bubble);
    const total = bubble.text.length;
    let n = 0;
    const t = setInterval(() => {
      n = Math.min(total, n + 1 + (Math.random() < 0.3 ? 1 : 0));
      setTyped({ id: bubble.id, n });
      if (n >= total) clearInterval(t);
    }, TYPE_MS);
    return () => clearInterval(t);
  }, [bubble]);

  // mouth flap on every TTS word boundary
  useEffect(() => subscribeFlap(() => {
    const el = mouthRef.current;
    if (!el || typeof el.animate !== 'function') return;
    try {
      el.animate(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.35)' }, { transform: 'scaleY(1.08)' }, { transform: 'scaleY(1)' }],
        { duration: 220, easing: 'ease-out' }
      );
    } catch (e) { /* ignore */ }
  }), [subscribeFlap]);

  const current = bubble || shownBubble; // shownBubble keeps the text during the exit animation
  const typed = bubble && typedState.id === bubble.id ? typedState.n : 0;
  const typing = !!bubble && typed < bubble.text.length;
  const talking = typing || speaking;
  const text = current?.text || '';
  const visible = bubble ? text.slice(0, typed) : text;

  // a one-shot action plays over the looping ambient animation of the phase; the action's
  // needs win (e.g. popcorn hides the right arm, a wave during popcorn brings its own arm)
  const actMeta = ACT_META[action] || {};
  const ambMeta = action ? {} : ACT_META[ambient] || {};
  const figureClass = [
    'host-figure',
    `emo-${emotion}`,
    talking ? 'is-talking' : '',
    ambient ? `amb-${ambient}` : '',
    action ? `act-${action} has-act` : '',
    actMeta.r || ambMeta.r ? 'uses-r' : '',
    actMeta.l || ambMeta.l ? 'uses-l' : '',
    actMeta.wide || ambMeta.wide || WIDE_EMOTIONS.has(emotion) ? 'is-wide' : '',
    Math.max(actMeta.wide || 0, ambMeta.wide || 0) > 1 ? 'is-xwide' : ''
  ].filter(Boolean).join(' ');

  return (
    <aside className="host">
      {/* full line for screen readers (the visible text is typed letter by letter) */}
      <span className="host-sr" aria-live="polite">{bubble?.text || ''}</span>
      <div className={`host-bubble ${bubble ? 'is-open' : ''}`} key={`bubble-${current?.id || 0}`}>
        {current && (
          <>
            <div className="host-bubble-name">{HOST_NAME}</div>
            <p className="host-bubble-text">
              <span className="host-bubble-visible">{visible}</span>
              {/* invisible remainder reserves the final size so the bubble does not grow */}
              <span className="host-bubble-ghost" aria-hidden="true">{text.slice(visible.length)}</span>
            </p>
          </>
        )}
      </div>
      <div className="host-figure-wrap" key={`figure-${entranceKey}`}>
        <div className={figureClass}>
          <HostFigure emotion={emotion} talking={talking} mouthRef={mouthRef} action={action || ambient} />
        </div>
      </div>
    </aside>
  );
}

export default Host;
