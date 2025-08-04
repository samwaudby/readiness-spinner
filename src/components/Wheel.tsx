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
};

const wedgeColors = ['fill-[--color-hot-pink]','fill-[--color-lilac]','fill-[--color-electric-blue]','fill-[--color-sunshine-yellow]','fill-[--color-lime]'];

export const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel({ title, options, enabledMap, onSpinEnd, sound, reducedMotion, colorClass, allowRespins }: WheelProps, ref) {
  const filtered = useMemo(() => (enabledMap ? options.filter(o => enabledMap[o] !== false) : options), [options, enabledMap]);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const tickTimer = useRef<number | null>(null);

  const spin = () => {
    if (reducedMotion) {
      const v = filtered[Math.floor(Math.random() * filtered.length)];
      setSelected(v);
      onSpinEnd(v);
      return;
    }
    if (spinning || filtered.length === 0) return;
    setSpinning(true);
    const turns = 5 + Math.random() * 3;
    const finalIndex = Math.floor(Math.random() * filtered.length);
    const perWedge = 360 / filtered.length;
    const targetAngle = 360 * turns + (finalIndex + 0.5) * perWedge;
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
        const v = filtered[finalIndex];
        setSpinning(false);
        setSelected(v);
        sound.chime();
        onSpinEnd(v);
        setAngle(targetAngle % 360);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => () => { if (tickTimer.current) tickTimer.current = null; }, []);
  useImperativeHandle(ref, () => ({ spin }));

  const radius = 120;
  const center = radius;
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
    <div className={clsx('rounded-2xl p-4 shadow-xl border-4', colorClass, 'bg-white/70 backdrop-blur')}> 
      <div className="flex items-center justify-between">
        <h3 className="font-comic text-2xl text-[--color-hot-pink] font-bold">{title}</h3>
        <button className="px-4 py-2 rounded-xl bg-[--color-electric-blue] text-[--color-deep-navy] font-bold" onClick={spin} disabled={spinning}>SPIN</button>
      </div>
      <div className="relative mx-auto mt-4 w-[260px] h-[260px]">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-[--color-deep-navy]"></div>
        <svg width={radius*2} height={radius*2} style={{ transform: `rotate(${angle}deg)`, transition: spinning ? undefined : 'transform 0.2s ease-out' }}>
          {wedges.map(({ d, i }) => (
            <path key={i} d={d} className={clsx(wedgeColors[i % wedgeColors.length])} stroke="white" strokeWidth={2} />
          ))}
          {wedges.map(({ label, i }) => {
            const a = ((i + 0.5) / filtered.length) * 2 * Math.PI - Math.PI / 2;
            const rx = center + (radius * 0.6) * Math.cos(a);
            const ry = center + (radius * 0.6) * Math.sin(a);
            return (
              <text key={i} x={rx} y={ry} textAnchor="middle" dominantBaseline="middle" className="font-comic fill-[--color-deep-navy] text-[10px] font-bold">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
      <div className="mt-3 text-center">
        <div className="text-sm text-[--color-deep-navy]">Selected:</div>
        <div className="font-comic text-xl">{selected ?? '—'}</div>
        {allowRespins && selected && (
          <button className="mt-2 text-sm underline text-[--color-hot-pink]" onClick={spin}>Re-spin</button>
        )}
      </div>
    </div>
  );
});
