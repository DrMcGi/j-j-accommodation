# Cinematic property website walkthrough

Status: 88-frame scroll-controlled walkthrough of the kitchen, living area, hallway, and bedroom, curated from the 220-frame source sequence. The camera advances between website chapters and holds while visitors read.

## Capture and playback

- Source: `public/images/IMG_4532.MOV` (110-second, portrait 4K HDR/HLG video).
- Original extraction: 220 frames sampled at two frames per second from 0 to 109.5 seconds.
- Curated playback: original frame IDs 1 through 142, with the requested exclusions; the final retained source frame is 142.
- Output: 540 ? 960 WebP, tone-mapped to BT.709 for browser display. The original camera file is unchanged.
- Frames 51-56 in the pre-trim sequence have the visible jeans blurred.

## Playback chapter ranges

| Website chapter | New output frame range | Reading beat |
| --- | ---: | --- |
| Welcome and property introduction | 1-31 | Kitchen to living area; hold at the first reading view. |
| Stay options and rates | 31-69 | Living area through the hall toward the bedroom; hold. |
| Included comforts | 69-79 | Bedroom entry and first bedroom view; hold. |
| Location and contact | 79-88 | Continue through the bedroom; end at retained source frame 142. |

Chapter boundary frames overlap so the camera transition remains continuous.

## Source frame relabeling

| New output files | Previous room-journey frame IDs | Count |
| --- | ---: | ---: |
| `frame-0001.webp`-`frame-0031.webp` | 1-31 | 31 |
| `frame-0032.webp`-`frame-0033.webp` | 36-37 | 2 |
| `frame-0034.webp` | 39 | 1 |
| `frame-0035.webp` | 41 | 1 |
| `frame-0036.webp`-`frame-0050.webp` | 43-57 | 15 |
| `frame-0051.webp` | 59 | 1 |
| `frame-0052.webp` | 61 | 1 |
| `frame-0053.webp` | 63 | 1 |
| `frame-0054.webp` | 65 | 1 |
| `frame-0055.webp` | 67 | 1 |
| `frame-0056.webp` | 69 | 1 |
| `frame-0057.webp` | 72 | 1 |
| `frame-0058.webp` | 74 | 1 |
| `frame-0059.webp`-`frame-0060.webp` | 76-77 | 2 |
| `frame-0061.webp`-`frame-0062.webp` | 79-80 | 2 |
| `frame-0063.webp` | 84 | 1 |
| `frame-0064.webp` | 86 | 1 |
| `frame-0065.webp` | 89 | 1 |
| `frame-0066.webp` | 92 | 1 |
| `frame-0067.webp`-`frame-0068.webp` | 94-95 | 2 |
| `frame-0069.webp` | 97 | 1 |
| `frame-0070.webp` | 99 | 1 |
| `frame-0071.webp` | 101 | 1 |
| `frame-0072.webp` | 103 | 1 |
| `frame-0073.webp` | 107 | 1 |
| `frame-0074.webp` | 109 | 1 |
| `frame-0075.webp` | 111 | 1 |
| `frame-0076.webp` | 113 | 1 |
| `frame-0077.webp` | 115 | 1 |
| `frame-0078.webp` | 117 | 1 |
| `frame-0079.webp` | 119 | 1 |
| `frame-0080.webp` | 121 | 1 |
| `frame-0081.webp` | 123 | 1 |
| `frame-0082.webp` | 125 | 1 |
| `frame-0083.webp` | 127 | 1 |
| `frame-0084.webp` | 129 | 1 |
| `frame-0085.webp` | 131 | 1 |
| `frame-0086.webp` | 133 | 1 |
| `frame-0087.webp` | 135 | 1 |
| `frame-0088.webp` | 142 | 1 |

The requested original frames 32-35, 38, 40, 42, 58, 60, 62, 64, 66, 68, 70-71, 73, 75, 78, 81-83, 85, 87-88, 90-91, 93, 96, 98, 100, 102, 104-106, 108, 110, 112, 114, 116, 118, 120, 122, 124, 126, 128, 130, 132, 134, and 136-141 were removed. Frames after 142 were removed. The remaining files are consecutively numbered `frame-0001.webp` through `frame-0088.webp`.
