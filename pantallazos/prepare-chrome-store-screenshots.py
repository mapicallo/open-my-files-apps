"""Resize screenshots to Chrome Web Store size: 1280x800, 24-bit PNG, no alpha."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image

TARGET_W, TARGET_H = 1280, 800
BG = (255, 255, 255)


def load_flat_rgb(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    bg = Image.new("RGB", im.size, BG)
    bg.paste(im, mask=im.split()[3])
    return bg


def fit_and_pad(im: Image.Image) -> Image.Image:
    w, h = im.size
    scale = min(TARGET_W / w, TARGET_H / h)
    nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (TARGET_W, TARGET_H), BG)
    x = (TARGET_W - nw) // 2
    y = (TARGET_H - nh) // 2
    canvas.paste(resized, (x, y))
    return canvas


def main() -> None:
    root = Path(__file__).resolve().parent
    out = root / "chrome-web-store"
    out.mkdir(exist_ok=True)
    exts = {".png", ".jpg", ".jpeg", ".webp"}
    files = sorted(f for f in root.iterdir() if f.is_file() and f.suffix.lower() in exts)
    # Ignore output folder
    files = [f for f in files if f.parent == root]
    if not files:
        raise SystemExit("No images found next to this script.")
    for i, fp in enumerate(files, start=1):
        base = fp.stem
        im = load_flat_rgb(fp)
        final = fit_and_pad(im)
        dest = out / f"{i:02d}_{base}_1280x800.png"
        final.save(dest, "PNG", optimize=True)
        print(dest)


if __name__ == "__main__":
    main()
