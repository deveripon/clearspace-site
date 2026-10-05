// Clearspace in-browser demo: a stand-in for the desktop app's engine.
// Sample data only. Nothing on the visitor's computer is read, scanned or deleted.
(() => {
  const GB = 1e9;
  const P = '~/Projects';
  const item = (o) => ({ tags: [], paths: [o.subtitle.replace('~', '/Users/you')], ...o });

  const NEXT = {
    what: 'Compiled pages and the development cache that Next.js writes while you run `next dev` or `next build`.',
    after: 'The next `dev` or `build` run is slower once while Next.js rebuilds it.',
  };
  const TURBO = {
    what: 'Saved results of earlier builds, lints and tests so Turborepo can skip repeated work.',
    after: 'The next `turbo` run does the full work once, then the cache refills.',
  };
  const build = (id, title, kind, size, sub, tags = []) => item({
    id, category: 'build', title, kindLabel: kind, subtitle: sub, size, action: 'delete', risk: 'safe', recommended: true, tags,
    ...(kind === 'Turborepo cache' ? TURBO : NEXT),
    lose: 'No. Only generated files are removed. Your source code is untouched.',
    note: tags.includes('Used today') ? 'If its dev server is running, stop it before cleaning.' : null,
  });
  const deps = (id, title, size, sub, ago, active) => item({
    id, category: 'deps', title, kindLabel: 'node_modules', subtitle: sub, size, action: 'delete', risk: 'safe',
    recommended: !active, active, pm: 'pnpm', tags: [ago],
    what: 'Packages installed for this project.',
    after: 'Run `pnpm install` before you work on it again. It restores the exact versions from pnpm-lock.yaml.',
    lose: 'No, unless you edited files inside node_modules by hand. Your code, git history and .env files are not in there.',
    note: 'pnpm shares package files with its store, so most of this space is freed by "Unused packages in the pnpm store" in Developer caches.',
  });
  const wt = (id, name, branch, size, { unpushed = 0, dirty = 0, active = false } = {}) => item({
    id, category: 'leftovers', group: 'worktree', title: name, kindLabel: 'worktree of storefront',
    subtitle: `${P}/storefront/.claude/worktrees/${name}`, size, action: 'worktree',
    risk: dirty ? 'locked' : (unpushed || active ? 'check' : 'safe'), recommended: !dirty && !unpushed && !active,
    lockedReason: dirty ? `Has ${dirty} uncommitted changes. Commit or discard them first.` : null,
    tags: [`Branch ${branch}`, active ? 'Active in the last 24 hours' : 'Last active 12 days ago'],
    note: active ? 'Git activity in the last 24 hours: an AI agent may still be working here. Make sure it has finished.' : null,
    what: `A separate working copy an AI coding agent created on branch ${branch}. Your main storefront folder does not use it.`,
    after: `Removed with \`git worktree remove\`. The branch ${branch} stays in your repository.`,
    lose: unpushed
      ? `No commits are lost: its ${unpushed} commits not pushed yet stay on branch ${branch} in your main repo.`
      : 'No commits are lost: everything on this branch is already in your repository.',
  });
  const app = (id, title, size, sub, warn) => item({
    id, category: 'apps', title, subtitle: sub, size, action: 'empty',
    risk: warn ? 'check' : 'safe', recommended: !warn, kindLabel: warn ? 'not on the known-safe list' : null,
    what: 'Temporary files this app keeps to load faster.',
    after: 'The app recreates what it needs. It may be a little slower the first time. Quit the app first.',
    lose: warn || 'Usually not: this app is on Clearspace\'s list of caches known to hold only temporary files.',
  });

  let items = [
    build('b1', 'design-system', 'Next.js build cache', 14.2 * GB, `${P}/design-system/apps/docs`),
    build('b2', 'design-system', 'Turborepo cache', 11.6 * GB, `${P}/design-system`),
    build('b3', 'storefront', 'Next.js build cache', 2.4 * GB, `${P}/storefront`, ['Used today']),
    build('b4', 'marketing-site', 'Next.js build cache', 0.68 * GB, `${P}/marketing-site`),
    deps('d1', 'storefront', 1.42 * GB, `${P}/storefront`, 'Used today', true),
    deps('d2', 'design-system', 1.86 * GB, `${P}/design-system`, 'Used 4 days ago', true),
    deps('d3', 'marketing-site', 0.91 * GB, `${P}/marketing-site`, 'Not used for 2 months', false),
    deps('d4', 'side-project', 0.74 * GB, `${P}/side-project`, 'Not used for 5 months', false),
    deps('d5', 'old-api', 0.52 * GB, `${P}/archive/old-api`, 'Not used for 8 months', false),
    item({ id: 'b5', category: 'build', title: 'rust-cli', kindLabel: 'Rust build output', subtitle: `${P}/rust-cli`, size: 6.3 * GB,
      action: 'delete', risk: 'safe', recommended: true, tags: ['Not used for 3 months'],
      what: 'Compiled code and build artifacts Cargo writes while you build, test or run this project.',
      after: 'The next `cargo build` compiles everything again, which can take a few minutes.',
      lose: 'No. Only generated files are removed. Your source code is untouched.' }),
    item({ id: 'b6', category: 'build', title: 'android-app', kindLabel: 'Gradle build output', subtitle: `${P}/android-app`, size: 3.1 * GB,
      action: 'delete', risk: 'safe', recommended: true, tags: ['Not used for 2 months'],
      what: 'Compiled code and build artifacts Gradle writes for this project (Android, Kotlin or Java).',
      after: 'The next Gradle build compiles everything again.',
      lose: 'No. Only generated files are removed. Your source code is untouched.' }),
    item({ id: 'd6', category: 'deps', title: 'ml-notebooks', kindLabel: 'Python virtual environment', subtitle: `${P}/ml-notebooks`, size: 2.9 * GB,
      action: 'delete', risk: 'safe', recommended: true, active: false, installCmd: 'uv sync', tags: ['Not used for 4 months'],
      what: 'Python virtual environment for this project: the packages it needs, installed into .venv.',
      after: 'Run `uv sync` before you work on it again. It restores the exact versions from uv.lock.',
      lose: 'No, unless you installed packages into it by hand that your project files do not list. Your code is untouched.' }),
    item({ id: 'd7', category: 'deps', title: 'ios-app', kindLabel: 'CocoaPods', subtitle: `${P}/ios-app`, size: 1.2 * GB,
      action: 'delete', risk: 'check', recommended: false, active: false, installCmd: 'pod install', tags: ['Not used for 2 months'],
      what: 'CocoaPods for this project: the packages it needs, installed into Pods.',
      after: 'Run `pod install` before you work on it again. It restores the exact versions from Podfile.lock.',
      lose: 'No, unless you edited files inside Pods by hand. Your Podfile and code are untouched. CocoaPods keeps no per-file record of what it installed, so Clearspace cannot prove nothing in Pods was edited by hand. It is never selected for you.' }),
    wt('w1', 'agent-checkout-flow', 'feat/checkout-flow', 2.31 * GB),
    wt('w2', 'agent-search-filters', 'feat/search-filters', 2.12 * GB, { unpushed: 2 }),
    wt('w3', 'agent-fix-header', 'fix/header-overlap', 1.96 * GB, { active: true }),
    wt('w4', 'agent-pricing-page', 'feat/pricing-page', 1.74 * GB, { dirty: 3 }),
    item({ id: 'c1', category: 'leftovers', group: 'duplicate', title: 'storefront copy', kindLabel: 'Duplicate of storefront',
      subtitle: `${P}/storefront copy`, size: 6.8 * GB, action: 'trash', risk: 'check', recommended: false,
      tags: ['Same latest commit as the original'],
      what: 'A Finder copy of storefront, including its own node_modules and worktrees.',
      after: 'The whole folder moves to the Trash. You can put it back from the Trash until you empty it.',
      lose: 'It is at the same commit as the original, but uncommitted changes, untracked files and .env files were not compared. Look inside before cleaning.' }),
    item({ id: 'p1', key: 'pnpm-prune', category: 'pkg', title: 'Unused packages in the pnpm store', subtitle: '~/Library/pnpm/store',
      size: 7.9 * GB, sizeLabel: 'Up to', action: 'pnpm-prune', risk: 'safe', recommended: false,
      what: 'pnpm keeps one shared copy of every package on your Mac. After node_modules folders are deleted, their packages stay here until pruned.',
      after: 'Packages no project uses are removed. Projects you still have installed keep working.',
      lose: 'No, but they must be downloaded again (needs internet) when a project needs them.',
      note: 'This is where the space from deleted node_modules is actually freed.' }),
    item({ id: 'p2', key: 'npm', category: 'pkg', title: 'npm download cache', subtitle: '~/.npm/_cacache', size: 2.6 * GB,
      action: 'delete', risk: 'safe', recommended: true,
      what: 'Every package npm has ever downloaded, kept so repeat installs are faster.',
      after: 'npm downloads packages again the next time a project needs them.',
      lose: 'No, but they must be downloaded again (needs internet) when a tool needs them.' }),
    item({ id: 'p3', key: 'homebrew', category: 'pkg', title: 'Homebrew downloads', subtitle: '~/Library/Caches/Homebrew', size: 1.3 * GB,
      action: 'empty', risk: 'safe', recommended: true,
      what: 'Installer files Homebrew downloaded for packages that are already installed.',
      after: 'Nothing changes for installed tools. Reinstalls download again.',
      lose: 'No, but they must be downloaded again (needs internet) when needed.' }),
    item({ id: 'p4', key: 'playwright', category: 'pkg', title: 'Playwright browsers', subtitle: '~/Library/Caches/ms-playwright', size: 1.1 * GB,
      action: 'empty', risk: 'check', recommended: false,
      what: 'Chromium, Firefox and WebKit builds used by Playwright tests and browser tools.',
      after: 'Run `npx playwright install` before running browser tests again.',
      lose: 'No, but they must be downloaded again (needs internet).' }),
    item({ id: 'p5', key: 'xcode-derived', category: 'pkg', title: 'Xcode DerivedData', subtitle: '~/Library/Developer/Xcode/DerivedData', size: 8.4 * GB,
      action: 'empty', risk: 'safe', recommended: true,
      what: 'Xcode build products and indexes.', after: 'Xcode rebuilds and re-indexes projects the next time you open them.',
      lose: 'No, but they must be rebuilt when a tool needs them.' }),
    item({ id: 'p6', key: 'cargo-registry', category: 'pkg', title: 'Cargo downloaded crates', subtitle: '~/.cargo/registry/cache', size: 1.5 * GB,
      action: 'delete', risk: 'safe', recommended: true,
      what: 'Rust packages (crates) Cargo downloaded.', after: 'Cargo downloads crates again when a project needs them.',
      lose: 'No, but they must be downloaded again (needs internet) when a tool needs them.' }),
    app('a1', 'Google Chrome', 1.2 * GB, '~/Library/Caches/com.google.Chrome'),
    app('a2', 'Visual Studio Code', 0.86 * GB, '~/Library/Caches/com.microsoft.VSCode'),
    app('a3', 'Slack', 0.44 * GB, '~/Library/Caches/com.tinyspeck.slackmacgap'),
    app('a4', 'JetBrains', 1.6 * GB, '~/Library/Caches/JetBrains',
      'May contain Local History from JetBrains IDEs or Android Studio, which can recover code you never committed.'),
    item({ id: 'f1', category: 'files', title: 'Xcode_16.xip', kindLabel: 'Installer or archive', subtitle: '~/Downloads/Xcode_16.xip',
      size: 3.4 * GB, action: 'trash', risk: 'check', recommended: false, tags: ['Added 63 days ago'],
      what: 'A downloaded installer or archive. Once the app is installed or the files extracted, it is usually not needed.',
      after: 'It moves to the Trash. You can put it back until you empty the Trash.',
      lose: 'Only if you still need this file. Check before cleaning.' }),
    item({ id: 'f2', category: 'files', group: 'backup', title: 'My iPhone', kindLabel: 'iPhone 13 backup',
      subtitle: '~/Library/Application Support/MobileSync/Backup/00008030-SAMPLE', size: 18.6 * GB, action: 'trash', risk: 'check', recommended: false,
      tags: ['Backed up 214 days ago'],
      what: 'A backup of an iPhone or iPad that Finder made on this Mac.',
      after: 'It moves to the Trash. You can put it back until you empty the Trash.',
      lose: 'Yes, once the Trash is emptied: you could no longer restore the device from this backup. Keep it unless the device is backed up somewhere else, such as iCloud, or you no longer have it.' }),
  ];

  const CATS = [
    ['build', 'Build caches', 'Files that build tools create while you work: Next.js, Rust, Gradle, Swift, Flutter, Python test caches and more. They are rebuilt automatically.'],
    ['deps', 'Dependencies', 'Packages installed inside each project: node_modules, Python virtual environments, CocoaPods, Composer and more. They can be installed again from your project files.'],
    ['leftovers', 'Leftover copies', 'Extra working copies of projects: AI-agent worktrees and duplicated project folders.'],
    ['pkg', 'Developer caches', 'Download caches for npm, pip, Cargo, Gradle, Maven, Homebrew, Xcode and similar tools. They refill only with what you use.'],
    ['apps', 'App caches & logs', 'Temporary files that apps keep in your Library. Only caches known to be safe are selected for you. Apple system caches are never touched.'],
    ['files', 'Downloads, backups & Trash', 'Large files in Downloads, old iPhone and iPad backups, and what is already in your Trash. Nothing here is selected for you.'],
  ];
  const categories = () => CATS.map(([id, name, blurb]) => {
    const l = items.filter((i) => i.category === id);
    return { id, name, blurb, count: l.length, size: l.reduce((a, i) => a + i.size, 0) };
  });

  const disk = { total: 494.4 * GB, free: 21.7 * GB, used: 472.7 * GB };
  let history = [];
  const listeners = { scan: [], clean: [], menu: [] };
  const sub = (k) => (cb) => { listeners[k].push(cb); return () => { listeners[k] = listeners[k].filter((x) => x !== cb); }; };
  const emit = (k, p) => listeners[k].forEach((f) => f(p));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let settings = { projectRoots: ['~/Projects'], inactiveDays: 14, scanOnLaunch: true };
  let scanCount = 0;

  window.api = {
    getSettings: async () => settings,
    saveSettings: async (s) => (settings = { ...settings, ...s }),
    getHistory: async () => history,
    getDisk: async () => ({ ...disk }),
    pickFolder: async () => '~/Code',
    reveal: async () => {},
    openFullDiskAccess: async () => {},
    onScanProgress: sub('scan'), onCleanProgress: sub('clean'), onMenu: sub('menu'),
    scan: async () => {
      emit('scan', { phase: 'walk', detail: '~/Projects/design-system/apps/docs' });
      await wait(650);
      emit('scan', { phase: 'git', detail: '~/Projects/storefront/.claude/worktrees' });
      await wait(450);
      const n = items.length;
      for (let i = 1; i <= n; i += 3) { emit('scan', { phase: 'measure', detail: items[i - 1].title, done: i, total: n }); await wait(60); }
      return { items: items.map((i) => ({ ...i })), categories: categories(), warnings: [], disk: { ...disk }, roots: ['~/Projects'], scannedAt: Date.now(), scanId: `demo-${++scanCount}` };
    },
    clean: async (ids) => {
      const chosen = items.filter((i) => ids.includes(i.id) && i.risk !== 'locked');
      const before = { ...disk };
      for (let k = 0; k < chosen.length; k++) { emit('clean', { index: k + 1, total: chosen.length, title: chosen[k].title }); await wait(180); }
      // pnpm shares files with its store: deleting pnpm node_modules frees little until the store is pruned.
      const freed = chosen.reduce((a, i) => a + (i.category === 'deps' && i.pm === 'pnpm' ? i.size * 0.06 : i.key === 'pnpm-prune' ? i.size * 0.85 : i.size), 0);
      disk.free += freed; disk.used -= freed;
      items = items.filter((i) => !chosen.includes(i));
      history = [{ at: Date.now(), freed, estimated: chosen.reduce((a, i) => a + i.size, 0), items: chosen.length }, ...history];
      return {
        results: chosen.map((i) => ({ id: i.id, title: i.title, status: 'done', message: null })),
        before, after: { ...disk }, freed, estimated: chosen.reduce((a, i) => a + i.size, 0), finishedAt: Date.now(),
      };
    },
  };
})();
