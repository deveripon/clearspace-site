# Clearspace website

The landing page for [Clearspace](https://github.com/deveripon/clearSpace), a careful disk cleaner for developer Macs.

Plain HTML, CSS and JavaScript. There is no build step and nothing to install.

```
index.html            the landing page
assets/css/site.css   styles (design tokens at the top)
assets/js/site.js     reveal on scroll, menu, FAQ, copy buttons, GitHub stars/forks, small demos
assets/js/tour.js     the 37-second product tour (motion piece after the hero)
assets/video/         the tour exported as MP4 (1920×1080) for your own use; not deployed (.vercelignore)
tools/export-tour.py  re-exports the MP4 after you change the tour
tools/make-brand.py   rebuilds the logo SVGs in assets/brand/ (Hugeicons "Clean" icon + Inter Display wordmark)
tools/og-source.html  source of assets/img/og.png (render at 1200x630)
assets/img/           app screenshots, icons, social image (og.png)
demo/                 the real Clearspace interface running on sample data (demo-api.js)
vercel.json           clean URLs, security and cache headers
.vercelignore         keeps the MP4, tools and this README off the public site
LICENSE               © Ripon (deveripon), all rights reserved (the app itself is MIT)
```

## Preview locally

Double-click `index.html`, or serve the folder:

```bash
cd clearspace-site
python3 -m http.server 3000     # then open http://localhost:3000
```

All links are relative, so the folder works from any location: opened directly, served from a parent folder, or deployed.

## Deploy to Vercel

**Option A: Vercel CLI**

```bash
cd clearspace-site
npx vercel          # first time: link or create the project, accept the defaults
npx vercel --prod   # publish to production
```

**Option B: from GitHub.** Push this folder to a repository, then in Vercel choose **Add New → Project**, import the repository and keep the defaults: Framework Preset "Other", no build command, output directory `./`. If the repository holds more than this site (for example the whole `mac-clearspace` folder), set **Root Directory** to `clearspace-site`.

After the first deploy, set your domain in Vercel and replace `/assets/img/og.png` in the `og:image` meta tag of `index.html` with the full URL (for example `https://clearspace.example.com/assets/img/og.png`) so link previews show the image everywhere.

## Notes

- **Product tour:** `assets/js/tour.js` draws every frame from one clock, so it autoplays when scrolled into view, pauses, jumps between chapters and never autoplays for visitors who prefer reduced motion. Scene timing, captions and numbers are in the `SCENES` list. There is no download button on the page; to get a video file, run `tools/export-tour.py`. The MP4 is kept out of deployments by `.vercelignore`.
- **GitHub stars and forks** load from the public GitHub API in the visitor's browser and are cached for an hour. If GitHub can't be reached, the buttons simply show "Star" and "Fork" without numbers.
- **Support link:** the footer's Buy Me a Coffee button goes to `buymeacoffee.com/devripon` (search for `data-coffee` in `index.html`).

- **Design:** boxed hairline frame, graph-paper canvas, dark navbar, deep hero gradient, editorial headlines, in Clearspace teal. To use a different brand colour, change the `--mk-accent*` tokens and the gradient stops in `assets/css/site.css`.
- **Demo:** `demo/` contains copies of the app's `renderer` files with a sample-data stand-in for the engine. Nothing on a visitor's computer is read or changed. After changing the app's UI, copy `renderer/app.js` and `renderer/styles.css` into `demo/` again.
- **Screenshots:** `assets/img/app-*.png` and `og.png` are generated from the demo, so they only show sample project names.

## License

The website (design, copy, images, product tour and exported video) is © 2026 Ripon (deveripon), all rights reserved. See `LICENSE`. The Clearspace app is open source under the MIT License in its own repository.
# clearspace-site
# clearspace-site
