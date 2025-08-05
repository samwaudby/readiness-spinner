import { useMemo, useState } from 'react';
import type { Assignment, Person } from '../types';
import { copyToClipboard, formatDateShort } from '../utils';

type Props = {
  assignment: Assignment;
  persons: Person[];
  mode: 'capability' | 'platform';
};

export function AssignmentCard({ assignment, persons, mode }: Props) {
  const person = persons.find(p => p.id === assignment.personId);
  const date = formatDateShort(new Date(assignment.nextSyncISO));
  const initial = useMemo(() => {
    const heading = '🎡 Readiness Wheel of Dogfooding Fortune — Next week’s demo';
    const who = `• Who’s up: ${person?.name ?? ''}`;
    const which = mode === 'capability'
      ? `• ChatGPT Capability: ${assignment.capability}`
      : `• API / Tailor Build: ${assignment.platform}`;
    const brief = '• Brief: Quick, scrappy demo that boosts your productivity or advances Readiness goals. Share one “Try this” tip.';
    const when = `• Date: ${date}`;
    return `${heading}\n${who}\n${which}\n${brief}\n${when}`;
  }, [assignment.capability, assignment.platform, date, mode, person?.name]);

  const [draft, setDraft] = useState(initial);

  return (
    <div className="rounded-2xl p-4 shadow-xl border-4 border-[--color-lime] bg-white/80 backdrop-blur">
      <h3 className="font-comic text-2xl text-[--color-hot-pink] font-bold">Assignment Card</h3>
      <textarea
        className="mt-2 w-full min-h-40 p-2 border-2 rounded-lg text-[--color-deep-navy]"
        value={draft}
        onChange={e => setDraft(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 rounded-xl bg-[--color-sunshine-yellow] text-[--color-deep-navy] font-bold" onClick={() => copyToClipboard(draft)}>Copy to clipboard</button>
      </div>
    </div>
  );
}
