"""Create optional responsive menu assets without changing original images.

Run with Python and Pillow (authoring tools only; no application dependency).
Each derivative uses lossless WebP encoding after a Lanczos resize, and is kept
only when it is smaller than its original. The original remains the fallback.
"""

import io
import json
import re
from pathlib import Path

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUTPUT = PUBLIC / "optimized"
OUTPUT.mkdir(exist_ok=True)
WIDTHS = (480, 960, 1600)
MIN_BYTES = 300_000

catalogue = (ROOT / "src/data/menu.ts").read_text(encoding="utf8")
sources = re.findall(r'\bphoto:\s*["\']([^"\']+)["\']', catalogue)
manifest = {}

for source in sources:
    path = PUBLIC / source
    original_bytes = path.stat().st_size
    if original_bytes <= MIN_BYTES:
        continue
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original)
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        width, height = image.size
        variants = []
        for target_width in WIDTHS:
            if target_width >= width:
                continue
            target_height = round(height * target_width / width)
            resized = image.resize((target_width, target_height), Image.Resampling.LANCZOS, reducing_gap=3.0)
            encoded = io.BytesIO()
            resized.save(encoded, "WEBP", lossless=True, method=6, exact=True,
                         icc_profile=original.info.get("icc_profile", b""))
            payload = encoded.getvalue()
            if len(payload) >= original_bytes:
                continue
            with Image.open(io.BytesIO(payload)) as decoded:
                if decoded.convert(resized.mode).tobytes() != resized.tobytes():
                    raise RuntimeError(f"Lossless verification failed: {source} at {target_width}px")
            target = OUTPUT / f"{path.stem}-{target_width}.webp"
            target.write_bytes(payload)
            variants.append({
                "src": target.relative_to(PUBLIC).as_posix(),
                "width": target_width,
                "height": target_height,
                "bytes": len(payload),
            })
            print(f"{source}: {target_width}x{target_height}, {len(payload):,} bytes "
                  f"({100 * (1 - len(payload) / original_bytes):.0f}% smaller)")
        if variants:
            manifest[source] = {"width": width, "height": height, "bytes": original_bytes, "variants": variants}

(ROOT / "src/data/responsive-images.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
