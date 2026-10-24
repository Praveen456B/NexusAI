#!/usr/bin/env python3
"""
Generates valid PNG and SVG PWA icons in pure Python using standard library (zlib, struct).
No third-party dependencies required.
"""

import os
import zlib
import struct

def create_png(width: int, height: int, filepath: str, bg_color=(2, 6, 23), fg_color=(99, 102, 241), is_maskable=False):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raw image data (RGB)
    raw_data = bytearray()
    center_x, center_y = width / 2.0, height / 2.0
    radius = (width * 0.35) if is_maskable else (width * 0.42)
    inner_radius = radius * 0.65
    
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = (dx*dx + dy*dy) ** 0.5
            
            # Draw brain/radar concentric ring icon
            if dist <= radius:
                # Outer ring or glowing pattern
                if dist >= inner_radius and (int(dist) % 12 < 7):
                    # Cyan/indigo accent
                    r = int(fg_color[0] * 0.8 + 6)
                    g = int(fg_color[1] * 0.8 + 182)
                    b = int(fg_color[2] * 0.8 + 212)
                elif dist < inner_radius * 0.7:
                    # Center core
                    r, g, b = 245, 158, 11
                else:
                    r, g, b = fg_color
            else:
                r, g, b = bg_color
                
            raw_data.extend([min(255, max(0, r)), min(255, max(0, g)), min(255, max(0, b))])
            
    # IDAT chunk
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'wb') as f:
        f.write(png)
    print(f"Created {filepath} ({width}x{height})")

def main():
    public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    create_png(192, 192, os.path.join(public_dir, 'pwa-192x192.png'), is_maskable=False)
    create_png(512, 512, os.path.join(public_dir, 'pwa-512x512.png'), is_maskable=False)
    create_png(512, 512, os.path.join(public_dir, 'pwa-maskable-512x512.png'), is_maskable=True)
    create_png(180, 180, os.path.join(public_dir, 'apple-touch-icon.png'), is_maskable=False)

if __name__ == '__main__':
    main()
