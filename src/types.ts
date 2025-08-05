export type Person = { id: string; name: string; lastDemoISO?: string; ooo?: boolean };
export type Settings = { cooldownWeeks: number; slackWebhook?: string; soundsEnabled: boolean; reducedMotion?: boolean };
export type SpinResult = { personId?: string; capability?: string; platform?: string; ts: string };
export type Assignment = { personId: string; capability: string; platform: string; nextSyncISO: string };

export const DEFAULT_ROSTER: string[] = [
  'Tom McCann',
  'Alison McPhail',
  'Sara Caldwell',
  'Sean Lubbers',
  'Ben Tyson',
  'Christina Meng',
  'Christopher Ho',
  'Emelie Hurlbert',
  'Joe Salazar',
  'Juliann Igo',
  'Katie Pypes',
  'Leah Conner',
  'Lois Newman',
  'Pavlin Hristov'
];

export const CAPABILITIES = [
  'ChatGPT Agent','Deep Research + Connectors','Canvas app','GPT','Choose-Your-Own'
] as const;
export const PLATFORMS = [
  'Cursor / Vercel app','ChatKit implementation','Google Apps Script','Choose-Your-Own'
] as const;

export type OptionToggleMap = Record<string, boolean>; // enabled state per option
