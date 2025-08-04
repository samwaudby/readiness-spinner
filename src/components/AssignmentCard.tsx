import type { Assignment, Person } from '../types';
import { copyToClipboard, formatDateShort } from '../utils';

type Props = {
  assignment: Assignment;
  persons: Person[];
  slackWebhook?: string;
};

export function AssignmentCard({ assignment, persons, slackWebhook }: Props) {
  const person = persons.find(p => p.id === assignment.personId);
  const date = formatDateShort(new Date(assignment.nextSyncISO));
  const text = `🎡 *Next week’s Readiness demo*\n• Person: ${person?.name ?? ''}\n• Capability: ${assignment.capability}\n• Platform: ${assignment.platform}\n• Brief: Quick, scrappy demo that boosts your productivity or advances Readiness goals. Share one ‘Try this’ tip.\n• Date: ${date}`;

  const postToSlack = async () => {
    if (!slackWebhook) return alert('No Slack webhook configured in Admin.');
    try {
      const res = await fetch(slackWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
      if (!res.ok) throw new Error(await res.text());
      alert('Posted to Slack.');
    } catch (e: any) {
      alert('Slack post failed: ' + (e?.message ?? e));
    }
  };

  return (
    <div className="rounded-2xl p-4 shadow-xl border-4 border-[--color-lime] bg-white/80 backdrop-blur">
      <h3 className="font-comic text-2xl text-[--color-hot-pink] font-bold">Assignment Card</h3>
      <pre className="whitespace-pre-wrap text-[--color-deep-navy] mt-2">{text}</pre>
      <div className="mt-3 flex gap-2">
        <button className="px-3 py-2 rounded-xl bg-[--color-sunshine-yellow] text-[--color-deep-navy] font-bold" onClick={() => copyToClipboard(text)}>Copy to clipboard</button>
        <button className="px-3 py-2 rounded-xl bg-[--color-electric-blue] text-[--color-deep-navy] font-bold" onClick={postToSlack}>Post to Slack</button>
      </div>
    </div>
  );
}
