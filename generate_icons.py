"""
Fresko Staff Portal — PWA Icon Generator
Run: python3 generate_icons.py
Requires: pip3 install Pillow
Outputs: icon-192.png, icon-512.png, icon-180.png (all in same folder)

Brand: teal (#005F73) background, white rounded bars — matches Fresko theme
"""

from PIL import Image, ImageDraw

BRAND_COLOR = (0, 95, 115)   # #005F73 — Fresko primary teal

def make_icon(size, path):
    img  = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rounded square background
    r = int(size * 0.22)
    draw.rounded_rectangle([0, 0, size - 1, size - 1],
                            radius=r,
                            fill=BRAND_COLOR + (255,))

    # "F" lettermark built from 3 horizontal bars (decreasing width)
    # Widths as fraction of icon size
    bars   = [0.58, 0.40, 0.50]   # top (longest), mid (shortest), cross
    bh     = int(size * 0.105)
    gap    = int(size * 0.055)
    x0     = int(size * 0.14)
    total_h = 3 * bh + 2 * gap
    y0     = (size - total_h) // 2

    for i, w_frac in enumerate(bars):
        bw = int(size * w_frac)
        y  = y0 + i * (bh + gap)
        draw.rounded_rectangle(
            [x0, y, x0 + bw, y + bh],
            radius=int(bh * 0.45),
            fill=(255, 255, 255, 235)
        )

    img.save(path, 'PNG')
    print(f'✓ {path}  ({size}×{size})')

make_icon(192, 'icon-192.png')
make_icon(512, 'icon-512.png')
make_icon(180, 'icon-180.png')   # Apple touch icon

print('\nDone! Upload all 3 .png files to your GitHub repo.')
