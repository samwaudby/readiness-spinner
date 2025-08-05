type HeaderProps = {
  muted: boolean;
  onToggleMute: () => void;
  onOpenAdmin: () => void;
};

const MICRO = [
  'Spin responsibly.',
  'Ship the tiny win.',
  'May the odds be ever in your favor.',
  "Today’s vibe: experimental.",
];

export function Header({ muted, onToggleMute, onOpenAdmin }: HeaderProps) {
  const phrase = MICRO[Math.floor(Math.random() * MICRO.length)];
  return (
    <header className="w-full flex items-center justify-between p-4">
      <div>
        <h1 className="font-comic text-3xl md:text-4xl font-bold text-[--color-hot-pink]">Readiness Wheel of Dogfooding Fortune</h1>
        <div className="text-[--color-deep-navy] text-sm">{phrase}</div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onToggleMute} className="px-3 py-2 rounded-lg bg-white/70 text-[--color-deep-navy] border-2 border-[--color-lime] font-bold">
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={onOpenAdmin} aria-label="Admin" className="px-3 py-2 rounded-lg bg-white/70 text-[--color-deep-navy] border-2 border-[--color-electric-blue] font-bold">⚙️</button>
      </div>
    </header>
  );
}
