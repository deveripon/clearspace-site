"""Build the Clearspace logo set as SVG.

Symbol: the "Clean" icon from Hugeicons (free set, MIT, stroke rounded), placed on a teal tile.
Wordmark: "Clearspace" in Inter Display SemiBold, converted to outlines so it renders the same everywhere.

Usage: python3 tools/make-brand.py <out-dir>
"""
import math, sys, pathlib
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from _kern import pair_kern

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else 'brand'); OUT.mkdir(parents=True, exist_ok=True)

# ---- Brand colours
TEAL_TOP, TEAL_BOTTOM = '#1b9aa6', '#0a5964'
INK = '#0e1a1d'
MINT = '#a8efe6'

# ---- Hugeicons "Clean" (core-free-icons, 24x24, stroke 1.5)
CLEAN = [
    ('M21 3L13 11.5', 'line'),
    ('M9.44573 11.0854C6.96539 12.0368 4.98269 11.8736 3 11.0885C3.50059 17.531 6.50414 20.0089 10.5089 21C10.5089 21 13.5261 18.8664 13.961 13.8074C14.0081 13.2595 14.0317 12.9856 13.9178 12.6769C13.8038 12.3682 13.5802 12.1468 13.1329 11.704C12.3973 10.9757 12.0295 10.6116 11.5929 10.5204C11.1564 10.4293 10.5862 10.648 9.44573 11.0854Z', 'line'),
    ('M4.5 16.4464C4.5 16.4464 7 16.9286 9.5 15', 'line'),
    ('M8.5 7.25C8.5 7.94036 7.94036 8.5 7.25 8.5C6.55964 8.5 6 7.94036 6 7.25C6 6.55964 6.55964 6 7.25 6C7.94036 6 8.5 6.55964 8.5 7.25Z', 'spark'),
    ('M11.125 4H11M11.25 4C11.25 4.13807 11.1381 4.25 11 4.25C10.8619 4.25 10.75 4.13807 10.75 4C10.75 3.86193 10.8619 3.75 11 3.75C11.1381 3.75 11.25 3.86193 11.25 4Z', 'spark'),
]

def glyph_group(stroke=1.5, main='#fff', spark=None, extra=''):
    spark = spark or main
    paths = ''.join(
        f'<path d="{d}" stroke="{main if kind == "line" else spark}"/>' for d, kind in CLEAN)
    return f'<g fill="none" stroke-width="{stroke}" stroke-linecap="round" stroke-linejoin="round"{extra}>{paths}</g>'

def squircle(size, x=0, y=0, n=5.0, steps=96):
    """Superellipse tile (the continuous-corner shape used by macOS icons)."""
    a = size / 2; cx, cy = x + a, y + a; pts = []
    for i in range(steps):
        t = 2 * math.pi * i / steps
        c, s = math.cos(t), math.sin(t)
        pts.append((cx + a * math.copysign(abs(c) ** (2 / n), c), cy + a * math.copysign(abs(s) ** (2 / n), s)))
    return 'M' + ' L'.join(f'{px:.2f} {py:.2f}' for px, py in pts) + ' Z'

def tile(size, x=0, y=0, uid='cs', stroke=1.5, icon_scale=0.6, mono=None):
    """The app mark: teal squircle, white broom, mint sparkles. mono='#hex' for a one-colour tile."""
    sq = squircle(size, x, y)
    s = size * icon_scale / 18  # the icon's drawing spans 18 of its 24 units
    tx, ty = x + size / 2 - 12 * s, y + size / 2 - 12 * s
    if mono:
        return (f'<path d="{sq}" fill="{mono}"/>'
                f'<g transform="translate({tx:.3f} {ty:.3f}) scale({s:.4f})">{glyph_group(stroke, "#fff")}</g>')
    return f'''<defs>
    <linearGradient id="{uid}-bg" x1="0" y1="{y}" x2="0" y2="{y + size}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{TEAL_TOP}"/><stop offset="1" stop-color="{TEAL_BOTTOM}"/></linearGradient>
    <radialGradient id="{uid}-hl" cx="{x + size * 0.3}" cy="{y}" r="{size * 0.9}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <clipPath id="{uid}-clip"><path d="{sq}"/></clipPath>
  </defs>
  <path d="{sq}" fill="url(#{uid}-bg)"/>
  <path d="{sq}" fill="url(#{uid}-hl)"/>
  <path d="{sq}" fill="none" stroke="#fff" stroke-opacity="0.16" stroke-width="{size / 32:.3f}" clip-path="url(#{uid}-clip)"/>
  <g transform="translate({tx:.3f} {ty:.3f}) scale({s:.4f})">{glyph_group(stroke, "#fff", MINT)}</g>'''

# ---- Wordmark outlines
FONT = TTFont('/usr/share/fonts/opentype/inter/InterDisplay-SemiBold.otf')
UPM = FONT['head'].unitsPerEm; CAP = FONT['OS/2'].sCapHeight
GS = FONT.getGlyphSet(); CMAP = FONT.getBestCmap()
TRACK = -0.022  # em

def wordmark(text, cap_px, x=0, baseline=0, fill=INK):
    scale = cap_px / CAP
    names = [CMAP[ord(c)] for c in text]
    pen = SVGPathPen(GS); cursor = 0; bp = BoundsPen(GS)
    for i, n in enumerate(names):
        t = (scale, 0, 0, -scale, x + cursor * scale, baseline)
        GS[n].draw(TransformPen(pen, t)); GS[n].draw(TransformPen(bp, t))
        cursor += GS[n].width + (pair_kern(FONT, n, names[i + 1]) if i + 1 < len(names) else 0) + (TRACK * UPM if i + 1 < len(names) else 0)
    return f'<path fill="{fill}" d="{pen.getCommands()}"/>', bp.bounds  # bounds: xmin, ymin, xmax, ymax

def svg(w, h, body, title='Clearspace'):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}" role="img" aria-label="{title}">'
            f'<title>{title}</title>{body}</svg>\n')

def write(name, content): (OUT / name).write_text(content); print('wrote', OUT / name)

# Mark (logo tile), 64 grid
write('clearspace-mark.svg', svg(64, 64, tile(64, uid='m')))
# Favicon: same tile, bolder stroke and a larger icon so it holds at 16px
write('favicon.svg', svg(32, 32, tile(32, uid='f', stroke=1.9, icon_scale=0.66)))
# One-colour symbol (icon only, inherits currentColor)
write('clearspace-symbol.svg', svg(24, 24, glyph_group(1.5, 'currentColor', extra=' color="#0f7684"')))

# Horizontal lockups: the tiled mark beside the wordmark. Mark 40 high; cap height 16.5; gap 11.
M, CAPH, GAP = 40, 16.5, 11
def lockup(fill, uid):
    wm, (x0, y0, x1, y1) = wordmark('Clearspace', CAPH, x=M + GAP, baseline=M / 2 + CAPH / 2, fill=fill)
    return math.ceil(x1 + 1), tile(M, uid=uid) + wm
w, body = lockup(INK, 'l'); write('clearspace-logo.svg', svg(w, M, body))
w, body = lockup('#ffffff', 'd'); write('clearspace-logo-white.svg', svg(w, M, body))
# Wordmark only
wm, (x0, y0, x1, y1) = wordmark('Clearspace', 32, x=0, baseline=0, fill=INK)
pad = 2
write('clearspace-wordmark.svg', svg(math.ceil(x1 + pad), math.ceil(y1 - y0 + 2 * pad),
      f'<g transform="translate({pad - x0:.2f} {pad - y0:.2f})">{wm}</g>'))

# macOS app icon (1024 canvas, 824 tile, soft shadow), rendered to PNG separately
icon = f'''<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#002a30" flood-opacity="0.32"/></filter></defs>
<g filter="url(#sh)">{tile(824, 100, 92, uid='a', stroke=1.5, icon_scale=0.56)}</g>'''
write('app-icon.svg', svg(1024, 1024, icon))

# Full-bleed square (iOS home screen / apple-touch-icon applies its own corner mask)
s = 180 * 0.56 / 18
bleed = f'''<defs><linearGradient id="b-bg" x1="0" y1="0" x2="0" y2="180" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{TEAL_TOP}"/><stop offset="1" stop-color="{TEAL_BOTTOM}"/></linearGradient>
<radialGradient id="b-hl" cx="54" cy="0" r="162" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<rect width="180" height="180" fill="url(#b-bg)"/><rect width="180" height="180" fill="url(#b-hl)"/>
<g transform="translate({90 - 12 * s:.3f} {90 - 12 * s:.3f}) scale({s:.4f})">{glyph_group(1.5, "#fff", MINT)}</g>'''
write('touch-icon.svg', svg(180, 180, bleed))

# Inline lockup for the app sidebar: tiled mark plus a wordmark coloured by CSS (.logo-word)
wm, (x0, y0, x1, y1) = wordmark('Clearspace', CAPH, x=M + GAP, baseline=M / 2 + CAPH / 2, fill='currentColor')
write('logo-inline.svg', f'<svg xmlns="http://www.w3.org/2000/svg" class="logo" viewBox="0 0 {math.ceil(x1 + 1)} {M}" width="{math.ceil(x1 + 1)}" height="{M}" aria-hidden="true">' + tile(M, uid='side') + '<g class="logo-word">' + wm + '</g></svg>\n')
