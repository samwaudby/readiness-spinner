import type { Person, Settings } from './types';

export const ISO = (d = new Date()) => d.toISOString();

export const weeksBetween = (aISO?: string, b = new Date()) => {
  if (!aISO) return Infinity;
  const a = new Date(aISO);
  return (b.getTime() - a.getTime()) / (7 * 24 * 60 * 60 * 1000);
};

export const eligiblePersons = (persons: Person[], settings: Settings) =>
  persons.filter(p => !p.ooo && weeksBetween(p.lastDemoISO) >= settings.cooldownWeeks);

export const nextSyncDate = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d;
};

export const formatDateShort = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const pickRandom = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const copyToClipboard = async (text: string) => navigator.clipboard?.writeText ? navigator.clipboard.writeText(text) : Promise.reject('Clipboard unavailable');
