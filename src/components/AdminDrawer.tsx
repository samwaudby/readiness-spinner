import { useMemo, useState } from 'react';
import { CAPABILITIES, PLATFORMS } from '../types';
import type { OptionToggleMap, Person, Settings } from '../types';
import { exportSpinsCSV, loadCapabilityToggles, loadPlatformToggles, resetAll, saveCapabilityToggles, savePlatformToggles } from '../storage';

type Props = {
  open: boolean;
  onClose: () => void;
  persons: Person[];
  setPersons: (p: Person[]) => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
};

export function AdminDrawer({ open, onClose, persons, setPersons, settings, setSettings }: Props) {
  const [rosterText, setRosterText] = useState(persons.map(p => p.name).join('\n'));
  const [capToggles, setCapToggles] = useState<OptionToggleMap>(loadCapabilityToggles());
  const [platToggles, setPlatToggles] = useState<OptionToggleMap>(loadPlatformToggles());

  const parseRoster = () => {
    const names = rosterText.split(/\n+/).map(s => s.trim()).filter(Boolean);
    const existingByName = new Map(persons.map(p => [p.name, p] as const));
    const next = names.map((name, i) => existingByName.get(name) ?? ({ id: String(i+1), name }));
    setPersons(next);
  };

  const eligibleCount = useMemo(() => persons.filter(p => !p.ooo).length, [persons]);

  const downloadCSV = () => {
    const csv = exportSpinsCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'spins.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const onSaveToggles = () => {
    saveCapabilityToggles(capToggles);
    savePlatformToggles(platToggles);
    alert('Saved wheel toggles.');
  };

  const onReset = () => {
    if (confirm('Reset all data?')) { resetAll(); location.reload(); }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-white/95 border-l-4 border-[--color-electric-blue] shadow-2xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 flex items-center justify-between">
        <h2 className="font-comic text-2xl text-[--color-hot-pink] font-bold">Admin</h2>
        <button className="px-3 py-2 rounded-lg bg-[--color-lime] text-[--color-deep-navy] font-bold" onClick={onClose}>Close</button>
      </div>
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-64px)]">
        <section>
          <h3 className="font-comic text-xl text-[--color-deep-navy] font-bold">Roster</h3>
          <textarea className="w-full h-40 p-2 border-2 rounded-lg" value={rosterText} onChange={e => setRosterText(e.target.value)} />
          <div className="mt-2 flex gap-2">
            <button className="px-3 py-2 rounded-lg bg-[--color-sunshine-yellow] text-[--color-deep-navy] font-bold" onClick={parseRoster}>Parse</button>
            <div className="self-center text-sm text-[--color-deep-navy]">Eligible (OOO off): {eligibleCount}</div>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {persons.map(p => (
              <li key={p.id} className="flex items-center gap-2">
                <input type="checkbox" checked={!p.ooo} onChange={e => setPersons(persons.map(pp => pp.id === p.id ? { ...pp, ooo: !e.target.checked } : pp))} />
                <span className="text-[--color-deep-navy]">{p.name}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-comic text-xl text-[--color-deep-navy] font-bold">Cooldown</h3>
          <input type="number" min={0} className="border-2 p-2 rounded-lg w-24" value={settings.cooldownWeeks}
                 onChange={e => setSettings({ ...settings, cooldownWeeks: Math.max(0, Number(e.target.value)) })} />
        </section>

        <section>
          <h3 className="font-comic text-xl text-[--color-deep-navy] font-bold">Wheel options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-bold">Capabilities</div>
              {CAPABILITIES.map(k => (
                <label key={k} className="block">
                  <input type="checkbox" className="mr-2" checked={capToggles[k] !== false} onChange={e => setCapToggles({ ...capToggles, [k]: e.target.checked })} />{k}
                </label>
              ))}
            </div>
            <div>
              <div className="font-bold">Platforms</div>
              {PLATFORMS.map(k => (
                <label key={k} className="block">
                  <input type="checkbox" className="mr-2" checked={platToggles[k] !== false} onChange={e => setPlatToggles({ ...platToggles, [k]: e.target.checked })} />{k}
                </label>
              ))}
            </div>
          </div>
          <button className="mt-2 px-3 py-2 rounded-lg bg-[--color-lime] text-[--color-deep-navy] font-bold" onClick={onSaveToggles}>Save options</button>
        </section>

        <section>
          <h3 className="font-comic text-xl text-[--color-deep-navy] font-bold">Slack</h3>
          <input className="w-full border-2 p-2 rounded-lg" placeholder="Slack Incoming Webhook URL" value={settings.slackWebhook ?? ''}
                 onChange={e => setSettings({ ...settings, slackWebhook: e.target.value })} />
          <div className="text-sm text-[--color-deep-navy] mt-1">Optional. Used to post the Assignment Card.</div>
        </section>

        <section className="flex gap-2">
          <button className="px-3 py-2 rounded-lg bg-[--color-electric-blue] text-[--color-deep-navy] font-bold" onClick={downloadCSV}>Export spins CSV</button>
          <button className="px-3 py-2 rounded-lg bg-red-200 border-2 border-red-500 text-red-800 font-bold" onClick={onReset}>Reset all data</button>
        </section>
      </div>
    </div>
  );
}
