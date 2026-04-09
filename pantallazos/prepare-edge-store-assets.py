"""Microsoft Edge Add-ons listing images: logo 300x300, small promo 440x280."""
from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ICON = REPO / "extension" / "icons" / "icon128.png"
PANT = REPO / "pantallazos"
OUT = PANT / "edge-store"
PROMO_SCRIPT = PANT / "prepare-chrome-promo-tiles.py"


def main() -> None:
    if not ICON.is_file():
        raise SystemExit(f"Missing {ICON}")
    OUT.mkdir(parents=True, exist_ok=True)

    from PIL import Image

    im = Image.open(ICON).convert("RGB")
    logo = im.resize((300, 300), Image.Resampling.LANCZOS)
    logo_path = OUT / "extension-logo-300x300.png"
    logo.save(logo_path, "PNG", optimize=True)
    print(logo_path)

    subprocess.run([sys.executable, str(PROMO_SCRIPT)], check=True)
    src = PANT / "chrome-web-store" / "promo-small-440x280.png"
    dst = OUT / "promo-small-440x280.png"
    shutil.copy2(src, dst)
    print(dst)


if __name__ == "__main__":
    main()
