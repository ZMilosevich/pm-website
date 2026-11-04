"""Generate the checked-in smart-link QR SVG with local OpenCV."""

from pathlib import Path

import cv2


TARGET = "https://pacematcher.com/get?src=qr"
OUTPUT = Path("public/images/pacematcher-download-qr.svg")
QUIET_ZONE = 4

encoder = cv2.QRCodeEncoder_create()
image = encoder.encode(TARGET)
matrix = image == 0
size = matrix.shape[0]
svg_size = size + QUIET_ZONE * 2
paths = []

for y, row in enumerate(matrix):
    x = 0
    while x < size:
        if not row[x]:
            x += 1
            continue

        start = x
        while x < size and row[x]:
            x += 1
        run = x - start
        paths.append(f"M{start + QUIET_ZONE} {y + QUIET_ZONE}h{run}v1h-{run}z")

svg = f"""<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 {svg_size} {svg_size}" shape-rendering="crispEdges">
  <title>PaceMatcher app download QR code</title>
  <desc>Scan to open {TARGET}. Includes a four-module white quiet zone.</desc>
  <rect width="{svg_size}" height="{svg_size}" fill="#fff"/>
  <path d="{' '.join(paths)}" fill="#000"/>
</svg>
"""

OUTPUT.write_text(svg, encoding="utf-8")
print(f"Wrote {OUTPUT} for {TARGET} with a {QUIET_ZONE}-module quiet zone.")
