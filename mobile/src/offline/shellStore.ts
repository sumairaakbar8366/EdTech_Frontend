import * as FileSystem from 'expo-file-system/legacy';
import { SITE_URL } from '@/config';
import { refreshShell, shellIsStale, type ShellDeps, type ShellMeta } from './shell';

const DIR = () => `${FileSystem.documentDirectory}skool-shell/`;
const HTML = () => `${DIR()}index.html`;
const META = () => `${DIR()}meta.json`;

/** The saved copy of the website's pages (null before the first time the app was online). */
export async function loadShell(): Promise<{ html: string; meta: ShellMeta } | null> {
  try {
    const [html, meta] = await Promise.all([FileSystem.readAsStringAsync(HTML()), FileSystem.readAsStringAsync(META())]);
    return { html, meta: JSON.parse(meta) as ShellMeta };
  } catch { return null; }
}

const fsDeps: ShellDeps = {
  fetchText: async (url) => { const r = await fetch(url, { headers: { 'X-Requested-With': 'SkoolEdTechApp' } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); },
  fetchBytes: async (url) => { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); return new Uint8Array(await r.arrayBuffer()); },
  save: async (html, meta) => {
    await FileSystem.makeDirectoryAsync(DIR(), { intermediates: true }).catch(() => undefined);
    await FileSystem.writeAsStringAsync(`${DIR()}tmp.html`, html);
    await FileSystem.moveAsync({ from: `${DIR()}tmp.html`, to: HTML() }).catch(async () => { await FileSystem.deleteAsync(HTML(), { idempotent: true }); await FileSystem.moveAsync({ from: `${DIR()}tmp.html`, to: HTML() }); });
    await FileSystem.writeAsStringAsync(META(), JSON.stringify(meta));
  },
  now: () => Date.now(),
};

let running = false;
/** Saves (or refreshes) the copy when there is none or it is old. Quiet: any failure keeps what is already saved. */
export async function ensureShell(force = false): Promise<boolean> {
  if (running) return false;
  running = true;
  try {
    const have = await loadShell();
    if (!force && !shellIsStale(have?.meta ?? null, SITE_URL, Date.now())) return true;
    return (await refreshShell(SITE_URL, fsDeps)).ok;
  } finally { running = false; }
}
