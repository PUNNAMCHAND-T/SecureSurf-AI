"""
SecureSurf AI - Extension Icon Generator
Generates PNG icons for the Chrome extension from scratch using only stdlib/pillow.
Run: python generate_icons.py
"""

import os
import struct
import zlib

ICONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'extension', 'icons')
os.makedirs(ICONS_DIR, exist_ok=True)


def create_png(width, height, pixels):
    """
    Create a minimal valid PNG from RGBA pixel data.
    pixels: list of (R, G, B, A) tuples, row-major order.
    """
    def make_chunk(chunk_type, data):
        c = chunk_type + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    # PNG signature
    sig = b'\x89PNG\r\n\x1a\n'

    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT - build raw image data
    raw = b''
    for y in range(height):
        raw += b'\x00'  # filter type: None
        for x in range(width):
            r, g, b, a = pixels[y * width + x]
            raw += bytes([r, g, b, a])

    compressed = zlib.compress(raw, 9)
    idat = make_chunk(b'IDAT', compressed)

    # IEND
    iend = make_chunk(b'IEND', b'')

    return sig + ihdr + idat + iend


def draw_shield_icon(size):
    """
    Draw a shield icon with 'PG' text feel.
    Returns a flat list of (R,G,B,A) tuples.
    """
    pixels = []

    # Colors
    BG          = (0, 0, 0, 0)           # Transparent background
    SHIELD_DARK = (15, 15, 35, 255)      # Shield body dark fill
    GRAD_START  = (102, 126, 234, 255)   # Gradient start (indigo)
    GRAD_END    = (118, 75, 162, 255)    # Gradient end (purple)
    WHITE       = (240, 240, 245, 255)   # Text/highlight

    def lerp_color(c1, c2, t):
        return tuple(max(0, min(255, int(c1[i] + (c2[i] - c1[i]) * t))) for i in range(4))

    def dist(x1, y1, x2, y2):
        return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5

    cx, cy = size / 2, size / 2
    margin = size * 0.08
    shield_w = size - 2 * margin
    shield_h = size - 2 * margin

    for y in range(size):
        row = []
        for x in range(size):
            nx = (x - margin) / shield_w   # normalized 0..1
            ny = (y - margin) / shield_h   # normalized 0..1

            # Shield shape: top rectangle + bottom triangle
            in_top = (0.05 <= nx <= 0.95) and (0.05 <= ny <= 0.60)
            # Bottom triangle: taper to point
            if 0.55 <= ny <= 0.95:
                half = 0.5 - (ny - 0.55) / 0.8 * 0.45
                in_bottom = (0.5 - half <= nx <= 0.5 + half)
            else:
                in_bottom = False

            in_shield = in_top or in_bottom

            if in_shield:
                # Gradient left→right, top→bottom
                t = (nx + ny) / 2
                color = lerp_color(GRAD_START, GRAD_END, t)

                # Anti-aliasing edge
                edge_dist = min(nx - 0.05, 0.95 - nx, ny - 0.05) * size
                if edge_dist < 1.5:
                    alpha = max(0, min(255, int(color[3] * min(edge_dist / 1.5, 1))))
                    color = color[:3] + (alpha,)

                # Inner highlight line (checkmark area)
                # Draw a simple white 'check' in center
                check_x = (nx - 0.3) * size
                check_y = (ny - 0.4) * size
                # Left arm of checkmark
                left_line = abs(check_x + check_y * 0.5)
                # Right arm of checkmark
                right_line = abs(check_x - check_y)
                is_check = (
                    (left_line < size * 0.04 and 0.30 <= nx <= 0.48 and 0.42 <= ny <= 0.60) or
                    (right_line < size * 0.04 and 0.44 <= nx <= 0.72 and 0.35 <= ny <= 0.58)
                )

                if is_check:
                    color = WHITE

                row.append(color)
            else:
                row.append(BG)
        pixels.extend(row)

    return pixels


def generate_icons():
    sizes = [16, 32, 48, 128]
    for size in sizes:
        print(f"Generating icon{size}.png...")
        pixels = draw_shield_icon(size)
        png_data = create_png(size, size, pixels)
        path = os.path.join(ICONS_DIR, f'icon{size}.png')
        with open(path, 'wb') as f:
            f.write(png_data)
        print(f"  OK Saved to {path} ({len(png_data)} bytes)")

    print("\nAll icons generated successfully!")
    print(f"Icons location: {ICONS_DIR}")


if __name__ == '__main__':
    generate_icons()
