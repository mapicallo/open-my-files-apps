"""Chrome Web Store promotional tiles: small 440x280, marquee 1400x560. RGB PNG, no alpha."""
from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# Brand (matches extension panel)
TOP = (79, 70, 229)  # #4f46e5
BOT = (49, 46, 129)  # #312e81
TEXT = (255, 255, 255)
SUB = (224, 231, 255)  # #e0e7ff


def vertical_gradient(size: tuple[int, int], top: tuple[int, int, int], bottom: tuple[int, int, int]) -> Image.Image:
    w, h = size
    out = Image.new("RGB", size)
    draw = ImageDraw.Draw(out)
    for y in range(h):
        t = y / max(h - 1, 1)
        r = int(top[0] + (bottom[0] - top[0]) * t)
        g = int(top[1] + (bottom[1] - top[1]) * t)
        b = int(top[2] + (bottom[2] - top[2]) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return out


def load_icon_rgb(path: Path, size: int) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    im = im.resize((size, size), Image.Resampling.LANCZOS)
    bg = Image.new("RGB", (size, size), TOP)
    bg.paste(im, mask=im.split()[3])
    return bg


def get_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    windir = Path(os.environ.get("WINDIR", r"C:\Windows"))
    name = "segoeuib.ttf" if bold else "segoeui.ttf"
    p = windir / "Fonts" / name
    try:
        return ImageFont.truetype(str(p), size)
    except OSError:
        try:
            return ImageFont.truetype(str(windir / "Fonts" / "arial.ttf"), size)
        except OSError:
            return ImageFont.load_default()


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0]


def draw_small_tile(icon_path: Path, dest: Path) -> None:
    w, h = 440, 280
    base = vertical_gradient((w, h), TOP, BOT)
    icon_sz = 120
    ic = load_icon_rgb(icon_path, icon_sz)
    ix = (w - icon_sz) // 2
    iy = 28
    base.paste(ic, (ix, iy))
    draw = ImageDraw.Draw(base)
    title = get_font(22, bold=True)
    sub = get_font(14, bold=False)
    t1 = "Open my files & apps"
    t2 = "Files, folders & URLs — one panel"
    y = iy + icon_sz + 14
    draw.text(((w - text_width(draw, t1, title)) // 2, y), t1, fill=TEXT, font=title)
    y += 28
    draw.text(((w - text_width(draw, t2, sub)) // 2, y), t2, fill=SUB, font=sub)
    base.save(dest, "PNG", optimize=True)


def draw_marquee(icon_path: Path, dest: Path) -> None:
    w, h = 1400, 560
    base = vertical_gradient((w, h), TOP, BOT)
    icon_sz = 300
    ic = load_icon_rgb(icon_path, icon_sz)
    pad_x = 96
    iy = (h - icon_sz) // 2
    base.paste(ic, (pad_x, iy))
    draw = ImageDraw.Draw(base)
    title_f = get_font(52, bold=True)
    sub_f = get_font(24, bold=False)
    tx = pad_x + icon_sz + 64
    ty = h // 2 - 76
    draw.text((tx, ty), "Open my files & apps", fill=TEXT, font=title_f)
    draw.text((tx, ty + 62), "Launch files, folders & URLs from one floating panel.", fill=SUB, font=sub_f)
    draw.text((tx, ty + 98), "Optional Windows helper for native pickers. Data stays local.", fill=SUB, font=sub_f)
    base.save(dest, "PNG", optimize=True)


def main() -> None:
    root = Path(__file__).resolve().parent
    repo = root.parent
    icon = repo / "extension" / "icons" / "icon128.png"
    if not icon.is_file():
        raise SystemExit(f"Missing icon: {icon}")
    out = root / "chrome-web-store"
    out.mkdir(exist_ok=True)
    draw_small_tile(icon, out / "promo-small-440x280.png")
    draw_marquee(icon, out / "promo-marquee-1400x560.png")
    print(out / "promo-small-440x280.png")
    print(out / "promo-marquee-1400x560.png")


if __name__ == "__main__":
    main()
