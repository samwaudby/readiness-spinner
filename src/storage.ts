import type { Assignment, OptionToggleMap, Person, Settings, SpinResult } from './types';
import { DEFAULT_ROSTER, CAPABILITIES, PLATFORMS } from './types';

const LS_KEYS = {
  persons: 'rsw_persons',
  settings: 'rsw_settings',
  spins: 'rsw_spins',
  assignments: 'rsw_assignments',
  capabilityToggles: 'rsw_capability_toggles',
  platformToggles: 'rsw_platform_toggles',
};

const safeParse = <T>(json: string | null, fallback: T): T => {
  try { return json ? (JSON.parse(json) as T) : fallback; } catch { return fallback; }
};

export const loadPersons = (): Person[] => {
  const fromLS = safeParse<Person[]>(localStorage.getItem(LS_KEYS.persons), []);
  if (fromLS.length) {
    const lsNames = new Set(fromLS.map(p => p.name));
    const defaults = DEFAULT_ROSTER;
    const allMatch = defaults.length === fromLS.length && defaults.every(n => lsNames.has(n));
    if (allMatch) return fromLS;
    // Sync to DEFAULT_ROSTER order and membership while preserving flags if present
    const byName = new Map(fromLS.map(p => [p.name, p] as const));
    const next: Person[] = defaults.map((name, i) => {
      const ex = byName.get(name);
      return { id: String(i+1), name, lastDemoISO: ex?.lastDemoISO, ooo: ex?.ooo };
    });
    localStorage.setItem(LS_KEYS.persons, JSON.stringify(next));
    return next;
  }
  // seed from default roster
  const seeded: Person[] = DEFAULT_ROSTER.map((name, i) => ({ id: String(i+1), name }));
  localStorage.setItem(LS_KEYS.persons, JSON.stringify(seeded));
  return seeded;
};

export const savePersons = (persons: Person[]) => localStorage.setItem(LS_KEYS.persons, JSON.stringify(persons));

export const loadSettings = (): Settings => {
  const defaults: Settings = { cooldownWeeks: 4, soundsEnabled: true, reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
  const s = safeParse<Settings>(localStorage.getItem(LS_KEYS.settings), defaults);
  return { ...defaults, ...s };
};
export const saveSettings = (s: Settings) => localStorage.setItem(LS_KEYS.settings, JSON.stringify(s));

export const loadSpins = (): SpinResult[] => safeParse<SpinResult[]>(localStorage.getItem(LS_KEYS.spins), []);
export const pushSpin = (r: SpinResult) => {
  const arr = loadSpins();
  arr.unshift(r);
  localStorage.setItem(LS_KEYS.spins, JSON.stringify(arr.slice(0, 200)));
};

export const loadAssignments = (): Assignment[] => safeParse<Assignment[]>(localStorage.getItem(LS_KEYS.assignments), []);
export const pushAssignment = (a: Assignment) => {
  const arr = loadAssignments();
  arr.unshift(a);
  localStorage.setItem(LS_KEYS.assignments, JSON.stringify(arr.slice(0, 200)));
};

const mapFrom = (opts: readonly string[]): OptionToggleMap => Object.fromEntries(opts.map(o => [o, true]));
export const loadCapabilityToggles = (): OptionToggleMap => ({ ...mapFrom(CAPABILITIES), ...safeParse<OptionToggleMap>(localStorage.getItem(LS_KEYS.capabilityToggles), {}) });
export const saveCapabilityToggles = (m: OptionToggleMap) => localStorage.setItem(LS_KEYS.capabilityToggles, JSON.stringify(m));
export const loadPlatformToggles = (): OptionToggleMap => ({ ...mapFrom(PLATFORMS), ...safeParse<OptionToggleMap>(localStorage.getItem(LS_KEYS.platformToggles), {}) });
export const savePlatformToggles = (m: OptionToggleMap) => localStorage.setItem(LS_KEYS.platformToggles, JSON.stringify(m));

export const exportSpinsCSV = (): string => {
  const rows = loadSpins();
  const header = ['ts','personId','capability','platform'];
  const lines = [header.join(',')].concat(rows.map(r => [r.ts, r.personId ?? '', r.capability ?? '', r.platform ?? ''].map(v => `"${v}"`).join(',')));
  return lines.join('\n');
};

export const resetAll = () => {
  Object.values(LS_KEYS).forEach(k => localStorage.removeItem(k));
};
