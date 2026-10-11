import { useLayoutEffect, useRef, useState } from 'react';
import './Fog.css';

export const meta = {
  type: 'fog',
  name: 'Mgła',
  icon: '🌫️',
  hint: 'Zdrap mgłę palcem!',
};

const LETTERS = ['A', 'B', 'C', 'D'];
const TARGET = 0.6; // fraction of fog that must be scratched off
const SAMPLE_MS = 200;
const GRID_X = 24;
const GRID_Y = 32;
const CLOUDS = ['☁️', '☁️', '⛅', '☁️', '☁️', '🌥️', '☁️'];

function brushRadius(w, h) {
  // thick brush, scaled to the play area (CSS px)
  return Math.max(24, Math.min(40, Math.min(w, h) * 0.09));
}

function paintFog(ctx, w, h) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#9aa3b8');
  g.addColorStop(0.5, '#c3c9d6');
  g.addColorStop(1, '#8a92a8');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // grain / noise
  const dots = Math.round((w * h) / 90);
  for (let i = 0; i < dots; i += 1) {
    const v = 150 + Math.floor(Math.random() * 90);
    ctx.fillStyle = `rgba(${v},${v},${v + 8},${0.25 + Math.random() * 0.35})`;
    const s = 1 + Math.random() * 2.5;
    ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
  }

  // soft puffs
  for (let i = 0; i < 10; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 40 + Math.random() * 80;
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(240,243,250,0.55)');
    rg.addColorStop(1, 'rgba(240,243,250,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // cloud emojis
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  CLOUDS.forEach((c, i) => {
    const size = 34 + Math.random() * 26;
    ctx.font = `${size}px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    ctx.globalAlpha = 0.55 + Math.random() * 0.3;
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = ((col + 0.5) / 3) * w + (Math.random() - 0.5) * w * 0.15;
    const y = ((row + 0.5) / 3) * h + (Math.random() - 0.5) * h * 0.12;
    ctx.fillText(c, x, y);
  });

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#3a4060';
  ctx.font = `700 ${Math.round(Math.min(22, w * 0.06))}px system-ui, sans-serif`;
  ctx.fillText('👆 Zdrapuj tutaj', w / 2, h / 2);
  ctx.restore();
}

export default function Fog({ answers = [], onComplete, playSound }) {
  const areaRef = useRef(null);
  const canvasRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const playSoundRef = useRef(playSound);
  const doneRef = useRef(false);
  const [progress, setProgress] = useState(0); // 0..1 towards TARGET
  const [done, setDone] = useState(false);

  onCompleteRef.current = onComplete;
  playSoundRef.current = playSound;

  // layout effect: fog must be painted before the first frame, otherwise the
  // answers would flash uncovered for a moment
  useLayoutEffect(() => {
    const area = areaRef.current;
    const canvas = canvasRef.current;
    if (!area || !canvas) return undefined;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let initialized = false;
    let dirty = false;
    let lastPoint = null;
    let activePointer = null;
    let finishTimer = null;
    let lastTapSound = 0;
    let canvasRect = null;
    const sampler = document.createElement('canvas');
    sampler.width = GRID_X;
    sampler.height = GRID_Y;
    const sctx = sampler.getContext('2d', { willReadFrequently: true });

    const sound = (t) => {
      try {
        playSoundRef.current?.(t);
      } catch {
        /* ignore */
      }
    };

    const resize = () => {
      const rect = area.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      const nextDpr = Math.min(window.devicePixelRatio || 1, 3);
      if (initialized && w === cssW && h === cssH && nextDpr === dpr) return;

      canvasRect = null;
      // keep already-scratched holes when the canvas changes size
      let snapshot = null;
      const oldW = cssW;
      const oldH = cssH;
      if (initialized && canvas.width > 0 && canvas.height > 0) {
        snapshot = document.createElement('canvas');
        snapshot.width = canvas.width;
        snapshot.height = canvas.height;
        snapshot.getContext('2d').drawImage(canvas, 0, 0);
      }

      cssW = w;
      cssH = h;
      dpr = nextDpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!doneRef.current) paintFog(ctx, w, h);
      if (snapshot) {
        // old content keeps its CSS-pixel position and scale (no stretching);
        // any newly exposed area gets fresh fog
        ctx.clearRect(0, 0, Math.min(oldW, w), Math.min(oldH, h));
        ctx.drawImage(snapshot, 0, 0, oldW, oldH);
      }
      initialized = true;
      dirty = true;
      area.classList.add('is-ready');
    };

    const toLocal = (e) => {
      if (!canvasRect) canvasRect = canvas.getBoundingClientRect();
      return { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top };
    };

    const scratch = (from, to) => {
      const r = brushRadius(cssW, cssH);
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = r * 2;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.beginPath();
      if (from) {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      } else {
        ctx.arc(to.x, to.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      dirty = true;
    };

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      setProgress(1);
      setDone(true);
      sound('correct');
      finishTimer = window.setTimeout(() => {
        finishTimer = null;
        onCompleteRef.current?.();
      }, 450);
    };

    const measure = () => {
      if (!dirty || doneRef.current || !canvas.width || !canvas.height) return;
      dirty = false;
      // downscale the fog into a GRID_X×GRID_Y sampler and read its alpha –
      // much cheaper than reading the full-resolution canvas
      let data;
      try {
        sctx.clearRect(0, 0, GRID_X, GRID_Y);
        sctx.drawImage(canvas, 0, 0, GRID_X, GRID_Y);
        data = sctx.getImageData(0, 0, GRID_X, GRID_Y).data;
      } catch {
        return;
      }
      let cleared = 0;
      const total = GRID_X * GRID_Y;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 64) cleared += 1;
      }
      const frac = cleared / total;
      setProgress(Math.min(1, frac / TARGET));
      if (frac >= TARGET) finish();
    };

    const onDown = (e) => {
      if (doneRef.current || activePointer !== null) return;
      e.preventDefault();
      activePointer = e.pointerId;
      canvasRect = canvas.getBoundingClientRect();
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      const p = toLocal(e);
      scratch(null, p);
      lastPoint = p;
      const now = performance.now();
      if (now - lastTapSound > 600) {
        lastTapSound = now;
        sound('button-tap');
      }
    };

    const onMove = (e) => {
      if (e.pointerId !== activePointer || doneRef.current) return;
      e.preventDefault();
      const events = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
      const list = events.length ? events : [e];
      list.forEach((ev) => {
        const p = toLocal(ev);
        scratch(lastPoint, p);
        lastPoint = p;
      });
    };

    const onUp = (e) => {
      if (e.pointerId !== activePointer) return;
      activePointer = null;
      lastPoint = null;
      dirty = true;
      measure();
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(area);
    window.addEventListener('resize', resize);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('lostpointercapture', onUp);
    const interval = window.setInterval(measure, SAMPLE_MS);

    return () => {
      window.clearInterval(interval);
      if (finishTimer) window.clearTimeout(finishTimer);
      ro?.disconnect();
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('lostpointercapture', onUp);
    };
  }, []);

  const pct = Math.round(progress * 100);

  return (
    <div className="mg-fog" role="dialog" aria-label={`${meta.name}: ${meta.hint}`}>
      <header className="mg-fog__head">
        <div className="mg-fog__title">
          <span className="mg-fog__icon" aria-hidden="true">{meta.icon}</span>
          <span>{meta.name}</span>
        </div>
        <p className="mg-fog__hint">{meta.hint}</p>
        <div
          className="mg-fog__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-label="Postęp zdrapywania"
        >
          <div className="mg-fog__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="mg-fog__pct" data-testid="fog-progress">{pct}%</span>
      </header>

      <div className="mg-fog__area" ref={areaRef}>
        <ul className="mg-fog__answers">
          {LETTERS.map((l, i) => (
            <li key={l} className={`mg-fog__ans mg-fog__ans--${l.toLowerCase()}`}>
              <span className="mg-fog__letter">{l}</span>
              <span className="mg-fog__text">{answers[i] ?? ''}</span>
            </li>
          ))}
        </ul>
        <canvas
          ref={canvasRef}
          className={`mg-fog__canvas${done ? ' is-done' : ''}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
