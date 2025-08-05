import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { SoundKit } from '../sounds';

export type WheelHandle = { spin: () => void };

type WheelProps = {
  title: string;
  options: string[];
  enabledMap?: Record<string, boolean>;
  onSpinEnd: (value: string) => void;
  sound: SoundKit;
  reducedMotion: boolean;
  colorClass: string;
  allowRespins?: boolean;
  stepLabel?: string;
};

const wedgeVars = ['var(--color-hot-pink)','var(--color-lilac)','var(--color-electric-blue)','var(--color-sunshine-yellow)','var(--color-lime)'];

export const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel({ title, options, enabledMap, onSpinEnd, sound, reducedMotion, colorClass, allowRespins, stepLabel }: WheelProps, ref) {
  const filtered = useMemo(() => (enabledMap ? options.filter(o => enabledMap[o] !== false) : options), [options, enabledMap]);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const tickTimer = useRef<number | null>(null);

  // responsive sizing based on viewport
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [vh, setVh] = useState(typeof window !== 'undefined' ? window.innerHeight : 768);
  useEffect(() => {
    const on = () => { setVw(window.innerWidth); setVh(window.innerHeight); };
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const radius = Math.max(160, Math.min(Math.floor(vw * 0.26), Math.floor((vh - 320) * 0.38), 300));
  const margin = Math.max(80, Math.floor(radius * 0.5));
  const center = radius + margin;

  const perWedge = filtered.length ? 360 / filtered.length : 0;

  const spin = () => {
    if (reducedMotion) {
      const v = filtered[Math.floor(Math.random() * filtered.length)];
      setSelected(v);
      onSpinEnd(v);
      return;
    }
    if (spinning || filtered.length === 0) return;
    setSpinning(true);
    sound.whoosh?.();
    const turns = 5 + Math.random() * 3;
    const finalIndex = Math.floor(Math.random() * filtered.length);
    // rotate so that the chosen wedge lands under the top pointer (pointing down)
    const targetAngle = 360 * turns - (finalIndex + 0.5) * perWedge;
    const duration = 2600 + Math.random() * 700;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = angle + (targetAngle - angle) * eased;
      setAngle(current);
      if (t < 1) {
        if (!tickTimer.current || now - tickTimer.current > 50) {
          sound.tick();
          tickTimer.current = now;
        }
        requestAnimationFrame(step);
      } else {
        const resting = ((targetAngle % 360) + 360) % 360;
        // Determine which wedge is under the top pointer from resting angle
        const idx = ((Math.round(((360 - resting) / perWedge) - 0.5) % filtered.length) + filtered.length) % filtered.length;
        const v = filtered[idx];
        setSpinning(false);
        setSelected(v);
        sound.fanfare?.();
        onSpinEnd(v);
        setAngle(resting);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => () => { if (tickTimer.current) tickTimer.current = null; }, []);
  useImperativeHandle(ref, () => ({ spin }));

  const wedges = filtered.map((label, i) => {
    const a0 = (i / filtered.length) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / filtered.length) * 2 * Math.PI - Math.PI / 2;
    const x0 = center + radius * Math.cos(a0);
    const y0 = center + radius * Math.sin(a0);
    const x1 = center + radius * Math.cos(a1);
    const y1 = center + radius * Math.sin(a1);
    const largeArc = 0;
    const d = `M ${center} ${center} L ${x0} ${y0} A ${radius} ${radius} 0 ${largeArc} 1 ${x1} ${y1} Z`;
    return { d, label, i };
  });

  return (
    <div className={clsx('relative rounded-2xl p-4 shadow-xl border-4', colorClass, 'bg-white/70 backdrop-blur')}> 
      {stepLabel && (
        <div className="absolute -top-3 left-4 text-sm font-bold bg-white/80 px-2 py-0.5 rounded-full border-2 border-[--color-deep-navy]">{stepLabel}</div>
      )}
      <div className="flex items-center justify-between">
        <h3 className="font-comic text-2xl text-[--color-hot-pink] font-bold">{title}</h3>
        <button className="px-4 py-2 rounded-xl bg-[--color-electric-blue] text-[--color-deep-navy] font-bold" onClick={spin} disabled={spinning}>SPIN</button>
      </div>
      <div className="relative mx-auto mt-2" style={{ width: radius*2 + margin*2, height: radius*2 + margin*2 }}>
        <svg width={radius*2 + margin*2} height={radius*2 + margin*2} viewBox={`0 0 ${radius*2 + margin*2} ${radius*2 + margin*2}`}>
          <g transform={`rotate(${angle} ${center} ${center})`}>
            {wedges.map(({ d, i }) => (
              <path key={i} d={d} stroke="white" strokeWidth={2} fill={wedgeVars[i % wedgeVars.length]} />
            ))}
          </g>
          {/* fixed pointer inside main SVG, overlapping rim and pointing down */}
          {(() => {
            const pTop = margin - 46; // above rim
            const pBottom = margin + 10; // overlaps into wheel
            const pW = 40;
            const d = `M ${center - pW/2} ${pTop} Q ${center} ${pTop - 12} ${center + pW/2} ${pTop} L ${center + 9} ${pBottom} L ${center - 9} ${pBottom} Z`;
            return (
              <g>
                <path d={d} fill="#fff" stroke="var(--color-deep-navy)" strokeWidth={4} />
                <circle cx={center} cy={pTop + 14} r={6} fill="var(--color-sunshine-yellow)" stroke="var(--color-deep-navy)" strokeWidth={3} />
              </g>
            );
          })()}
          {/* labels overlay: fixed, track wedge angle */}
          {filtered.map((label, i) => {
            const base = ((i + 0.5) / filtered.length) * 2 * Math.PI - Math.PI / 2;
            const world = base + (angle * Math.PI / 180);
            const labelOffset = 24;
            const rx = center + (radius + labelOffset) * Math.cos(world);
            const ry = center + (radius + labelOffset) * Math.sin(world);
            // rotate tangentially to the circle; flip 180° on bottom half for readability
            const tangent = (world * 180 / Math.PI) + 90;
            const labelAngle = (tangent > 90 && tangent < 270) ? (tangent + 180) : tangent;
            return (
              <g key={i}>
                <text x={rx} y={ry} transform={`rotate(${labelAngle} ${rx} ${ry})`} textAnchor="middle" dominantBaseline="middle" className="font-comic fill-[--color-deep-navy] text-[18px] font-bold">
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-1 text-center">
        <div className="text-sm text-[--color-deep-navy]">Selected:</div>
        <div className="font-comic text-xl">{selected ?? '—'}</div>
        {allowRespins && selected && (
          <button className="mt-2 text-sm underline text-[--color-hot-pink]" onClick={spin}>Re-spin</button>
        )}
      </div>
    </div>
  );
});
