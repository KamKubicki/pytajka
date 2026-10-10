import React, { useEffect, useRef, useState } from 'react';
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
    case 'frown':
      return <path className="h-mouth-line" d="M87 163 Q100 151 113 163" />;
    case 'side':
      return <path className="h-mouth-line" d="M90 159 Q101 154 113 156" />;
    case 'smile':
    default:
      return <path className="h-mouth-line" d="M85 152 Q100 166 115 152" />;
  }
}

/** Prof. Pytajek – an original round quiz-show host drawn as inline SVG. */
function HostFigure({ emotion, talking, mouthRef }) {
  let shape = MOUTH_BY_EMOTION[emotion] || 'smile';
  if (talking && STROKE_MOUTHS.has(shape)) shape = emotion === 'sad' ? 'o' : 'open';

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

      <ellipse className="h-shadow" cx="100" cy="226" rx="54" ry="7" />

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

          {/* glasses: lenses, eyes, rims */}
          <line className="h-temple" x1="57" y1="108" x2="36" y2="103" />
          <line className="h-temple" x1="143" y1="108" x2="164" y2="103" />
          <circle cx="75" cy="112" r="18" fill="url(#hb-lens)" />
          <circle cx="125" cy="112" r="18" fill="url(#hb-lens)" />
          <g className="h-pupils">
            <g className="h-pupil">
              <circle cx="77" cy="114" r="7" className="h-iris" />
              <circle cx="79.5" cy="111" r="2.2" className="h-glint" />
            </g>
            <g className="h-pupil">
              <circle cx="123" cy="114" r="7" className="h-iris" />
              <circle cx="125.5" cy="111" r="2.2" className="h-glint" />
            </g>
          </g>
          <g className="h-happy-eyes">
            <path d="M65 117 Q75 104 85 117" />
            <path d="M115 117 Q125 104 135 117" />
          </g>
          <circle cx="75" cy="112" r="18" className="h-rim" />
          <circle cx="125" cy="112" r="18" className="h-rim" />
          <path className="h-rim" d="M93 109 Q100 104 107 109" />
          <circle cx="68" cy="105" r="3" className="h-lens-glare" />
          <circle cx="118" cy="105" r="3" className="h-lens-glare" />

          <path className="h-tear" d="M70 130 Q66 138 70 141 Q74 138 70 130 Z" />

          {/* cheeks, nose, moustache, mouth */}
          <ellipse cx="56" cy="140" rx="10" ry="6" className="h-cheek" />
          <ellipse cx="144" cy="140" rx="10" ry="6" className="h-cheek" />
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
    </svg>
  );
}

const TYPE_MS = 28;

function Host({ settings, sound }) {
  const { bubble, emotion, speaking, entranceKey, subscribeFlap } = useHostCommentary({ settings, sound });
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

  return (
    <aside className="host" aria-live="polite">
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
        <div className={`host-figure emo-${emotion} ${talking ? 'is-talking' : ''}`}>
          <HostFigure emotion={emotion} talking={talking} mouthRef={mouthRef} />
        </div>
      </div>
    </aside>
  );
}

export default Host;
