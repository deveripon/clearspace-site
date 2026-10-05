"""Export the product tour (assets/js/tour.js) to assets/video/clearspace-tour.mp4.

Needs: Python with Playwright (pip install playwright && playwright install chromium) and ffmpeg.
Run from the site folder:
    python3 -m http.server 8765 &
    python3 tools/export-tour.py
"""
import asyncio, os, shutil, subprocess, tempfile
from playwright.async_api import async_playwright

URL = os.environ.get("TOUR_URL", "http://127.0.0.1:8765/")
FPS = 30
OUT = "assets/video/clearspace-tour.mp4"

async def main():
    frames = tempfile.mkdtemp(prefix="tour-frames-")
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 1280, "height": 720}, device_scale_factor=1.5)
        await pg.goto(URL)
        await pg.wait_for_timeout(800)
        await pg.add_style_tag(content="""
          .mk-reveal{transform:none!important;opacity:1!important;transition:none!important}
          .ex-viewport{position:fixed!important;left:0;top:0;width:1280px!important;height:720px;z-index:9999;border-radius:0!important;box-shadow:none!important}
          .ex-big-play,.mk-header{display:none!important}""")
        await pg.evaluate("window.__clearspaceTour.seek(0)")
        await pg.wait_for_timeout(300)
        duration = await pg.evaluate("window.__clearspaceTour.duration")
        for i in range(int(duration * FPS) + 1):
            await pg.evaluate(f"window.__clearspaceTour.seek({i / FPS})")
            await pg.screenshot(path=f"{frames}/f{i:05d}.png", clip={"x": 0, "y": 0, "width": 1280, "height": 720})
        await b.close()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{frames}/f%05d.png",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                    "-vf", "scale=1920:1080:flags=lanczos", OUT], check=True)
    shutil.rmtree(frames)
    print("wrote", OUT)

asyncio.run(main())
