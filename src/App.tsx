import { useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { Wheel } from './components/Wheel';
import type { WheelHandle } from './components/Wheel';
import { AssignmentCard } from './components/AssignmentCard';
import { AdminDrawer } from './components/AdminDrawer';
import type { Assignment, Person, Settings } from './types';
import { CAPABILITIES, PLATFORMS } from './types';
import { ISO, eligiblePersons, formatDateShort, nextSyncDate } from './utils';
import { SoundKit } from './sounds';
import { loadPersons, loadSettings, pushAssignment, pushSpin, savePersons, saveSettings, loadCapabilityToggles, loadPlatformToggles } from './storage';

function App() {
  const [persons, setPersons] = useState<Person[]>(loadPersons());
  const [settings, setSettings] = useState<Settings>(loadSettings());
  const [capToggles] = useState(loadCapabilityToggles());
  const [platToggles] = useState(loadPlatformToggles());
  const [muted, setMuted] = useState(!settings.soundsEnabled);
  const [adminOpen, setAdminOpen] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [overrideAll, setOverrideAll] = useState(false);
  const [secondary, setSecondary] = useState<'capability' | 'platform'>('capability');

  const reducedMotion = !!settings.reducedMotion;
  const soundRef = useRef(new SoundKit(!muted, reducedMotion));
  useEffect(() => { soundRef.current.update(!muted, reducedMotion); }, [muted, reducedMotion]);

  useEffect(() => { savePersons(persons); }, [persons]);
  useEffect(() => { saveSettings({ ...settings, soundsEnabled: !muted }); }, [settings, muted]);

  const eligible = useMemo(() => eligiblePersons(persons, settings), [persons, settings]);
  const personOptions = eligible.length > 0 || overrideAll ? (overrideAll ? persons : eligible).map(p => p.name) : [];

  const spinPersonEnd = (name: string) => {
    const p = persons.find(pp => pp.name === name) ?? null;
    setSelectedPerson(p);
    pushSpin({ personId: p?.id, ts: ISO() });
  };
  const spinCapabilityEnd = (v: string) => { setSelectedCapability(v); pushSpin({ capability: v, ts: ISO() }); };
  const spinPlatformEnd = (v: string) => { setSelectedPlatform(v); pushSpin({ platform: v, ts: ISO() }); };

  const confirmPresent = () => {
    if (!selectedPerson) return;
    try {
      confetti({ particleCount: 140, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };
  const personWheelRef = useRef<WheelHandle | null>(null);
  const notHere = () => {
    setSelectedPerson(null);
    personWheelRef.current?.spin();
  };

  useEffect(() => {
    if (!selectedPerson) return;
    const hasSecondary = secondary === 'capability' ? !!selectedCapability : !!selectedPlatform;
    if (hasSecondary) {
      const next = nextSyncDate();
      const cap = selectedCapability ?? 'Choose-Your-Own';
      const plat = selectedPlatform ?? 'Choose-Your-Own';
      const a: Assignment = { personId: selectedPerson.id, capability: cap, platform: plat, nextSyncISO: next.toISOString() };
      setAssignment(a);
      pushAssignment(a);
      setPersons(ps => ps.map(p => p.id === selectedPerson.id ? { ...p, lastDemoISO: ISO() } : p));
    }
  }, [selectedPerson, selectedCapability, selectedPlatform, secondary]);

  const resetFlow = () => {
    setSelectedPerson(null); setSelectedCapability(null); setSelectedPlatform(null); setAssignment(null);
  };

  return (
    <div className="bg-fun animated min-h-screen text-[--color-deep-navy]">
      <Header
        muted={muted}
        onToggleMute={() => setMuted(m => !m)}
        onOpenAdmin={() => setAdminOpen(true)}
        secondary={secondary}
        onChangeSecondary={(s) => { setSecondary(s); setSelectedCapability(null); setSelectedPlatform(null); setAssignment(null); }}
      />
      <main className="p-4 max-w-3xl mx-auto flex flex-col gap-4">
        <div>
          <Wheel ref={personWheelRef} title="Person" options={personOptions} onSpinEnd={spinPersonEnd} sound={soundRef.current} reducedMotion={reducedMotion} colorClass="border-[--color-hot-pink]" />
          {eligible.length === 0 && !overrideAll && (
            <div className="mt-3 text-center">
              <div>No eligible people (all OOO or in cooldown).</div>
              <button className="mt-2 px-3 py-2 rounded-lg bg-white/80 border-2 border-[--color-deep-navy]" onClick={() => setOverrideAll(true)}>Override: include all</button>
            </div>
          )}
          {selectedPerson && (
            <div className="mt-2 flex gap-2 justify-center">
              <button className="px-3 py-2 rounded-lg bg-[--color-lime] text-[--color-deep-navy] font-bold" onClick={confirmPresent}>Present</button>
              <button className="px-3 py-2 rounded-lg bg-red-200 border-2 border-red-500 text-red-800 font-bold" onClick={notHere}>Not here</button>
            </div>
          )}
        </div>

        {secondary === 'capability' ? (
          <Wheel title="Capability" options={CAPABILITIES.slice()} enabledMap={capToggles} onSpinEnd={spinCapabilityEnd} sound={soundRef.current} reducedMotion={reducedMotion} colorClass="border-[--color-electric-blue]" allowRespins />
        ) : (
          <Wheel title="Platform" options={PLATFORMS.slice()} enabledMap={platToggles} onSpinEnd={spinPlatformEnd} sound={soundRef.current} reducedMotion={reducedMotion} colorClass="border-[--color-lilac]" allowRespins />
        )}

        <div>
          {assignment ? (
            <>
              <AssignmentCard assignment={assignment} persons={persons} slackWebhook={settings.slackWebhook} />
              <button className="mt-2 px-3 py-2 rounded-lg bg-white/80 border-2 border-[--color-deep-navy]" onClick={resetFlow}>New spin</button>
              <div className="text-sm">Date: {formatDateShort(new Date(assignment.nextSyncISO))}</div>
            </>
          ) : (
            <div className="rounded-2xl p-4 shadow-xl border-4 border-[--color-sunshine-yellow] bg-white/80 backdrop-blur">
              <div className="font-comic text-xl">Complete both wheels to generate the Assignment Card.</div>
            </div>
          )}
        </div>
      </main>
      <footer className="p-4 text-center text-[--color-deep-navy]">
        Quick, scrappy demo next week. Show before/after or one trick. End with one “Try this” tip.
      </footer>
      <AdminDrawer open={adminOpen} onClose={() => setAdminOpen(false)} persons={persons} setPersons={setPersons} settings={settings} setSettings={setSettings} />
    </div>
  );
}

export default App;
