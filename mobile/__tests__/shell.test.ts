import fs from 'node:fs';
import path from 'node:path';
import { assetsOf, buildShell, refreshShell, shellIsStale, type ShellMeta } from '../src/offline/shell';

// The website's real index.html (as built), so this fails if its structure changes.
const INDEX = fs.readFileSync(path.join(__dirname, '..', '..', 'apps', 'web', 'dist', 'index.html'), 'utf8');
const { scripts, styles } = assetsOf(INDEX);

describe('the saved copy of the website', () => {
  it('finds the website\'s script and styles', () => {
    expect(scripts).toHaveLength(1); expect(scripts[0]).toMatch(/^\/assets\/index-.*\.js$/);
    expect(styles).toHaveLength(1); expect(styles[0]).toMatch(/^\/assets\/index-.*\.css$/);
  });
  it('becomes one page with the code written inside, nothing left to download', () => {
    const html = buildShell(INDEX, { [scripts[0]!]: 'console.log("app"); const logo="/brand/skool-edtech-mark.png";', [styles[0]!]: 'body{margin:0}' }, { '/brand/skool-edtech-mark.png': 'data:image/png;base64,AAAA' });
    expect(html).toContain('<script type="module">'); expect(html).toContain('console.log("app")'); expect(html).toContain('<style>');
    expect(html).not.toMatch(/src="\/assets\//); expect(html).not.toMatch(/href="\/assets\//);
    expect(html).toContain('data:image/png;base64,AAAA'); expect(html).not.toContain('"/brand/skool-edtech-mark.png"');
    expect(html).toContain('schoolerp-theme'); // the page's own theme script is kept
    expect(html).toContain('<div id="root">');
  });
  it('code that contains </script> cannot break the page', () => {
    const html = buildShell(INDEX, { [scripts[0]!]: 'const s="</script><b>";', [styles[0]!]: '' }, {});
    expect(html.match(/<\/script>/g)!.length).toBe(2); // the page's theme script + the app script, nothing extra
  });
});

describe('saving it', () => {
  const files: Record<string, string> = { '/': INDEX, [scripts[0]!]: 'x="/brand/skool-edtech-logo.png";', [styles[0]!]: 'a{}' };
  const make = () => { const saved: { html?: string; meta?: ShellMeta } = {}; const deps = {
    fetchText: async (u: string) => { const p = u.replace('https://skooledtech.com', '') || '/'; if (!(p in files)) throw new Error('404'); return files[p]!; },
    fetchBytes: async () => new Uint8Array([1, 2, 3]), save: async (html: string, meta: ShellMeta) => { saved.html = html; saved.meta = meta; }, now: () => 1000,
  }; return { saved, deps }; };

  it('downloads the page, its files and its logo, and saves one file', async () => {
    const { saved, deps } = make();
    const r = await refreshShell('https://skooledtech.com', deps);
    expect(r.ok).toBe(true); expect(saved.meta).toMatchObject({ builtAt: 1000, site: 'https://skooledtech.com' });
    expect(saved.html).toContain('data:image/png;base64,AQID');
  });
  it('a page that is not the website (a hotel Wi-Fi sign-in page) is not saved', async () => {
    const { saved, deps } = make(); files['/'] = '<html><body>Please sign in to the Wi-Fi</body></html>';
    expect((await refreshShell('https://skooledtech.com', deps)).ok).toBe(false); expect(saved.html).toBeUndefined();
    files['/'] = INDEX;
  });
  it('a download that fails keeps the old copy (nothing is saved)', async () => {
    const { saved, deps } = make(); delete files[scripts[0]!];
    expect((await refreshShell('https://skooledtech.com', deps)).ok).toBe(false); expect(saved.html).toBeUndefined();
  });
  it('is refreshed when there is none, for another site, or older than half a day', () => {
    const meta: ShellMeta = { builtAt: 0, bytes: 1, site: 'https://skooledtech.com' };
    expect(shellIsStale(null, meta.site, 1)).toBe(true);
    expect(shellIsStale(meta, 'https://other.com', 1)).toBe(true);
    expect(shellIsStale(meta, meta.site, 3600_000)).toBe(false);
    expect(shellIsStale(meta, meta.site, 13 * 3600_000)).toBe(true);
  });
});
