# Full-property three-angle tour

Status: 54-frame exterior walkthrough connected to the Room tours selector. It plays the original approach, a reverse-ordered pass from the courtyard, and the alternate Unit 3 exterior angle.

## Playback order

| Playback angle | Source | Folder | Active frames |
| --- | --- | --- | ---: |
| Angle 1 | Original walkthrough source IDs 1-31 after approved cuts | `angle-1/frame-001.webp` to `frame-016.webp` | 16 |
| Angle 2 | Original walkthrough source IDs 92 down to 76, in reverse order | `angle-2/frame-001.webp` to `frame-013.webp` | 13 |
| Angle 3 | `IMG_4552.MOV`, the first 25 retained frames moved from the two-bedroom sequence | `angle-3/frame-001.webp` to `frame-025.webp` | 25 |

**Total active playback:** 54 frames in the order angle 1 -> angle 2 -> angle 3.

All three angle folders now use consecutive filenames beginning at `frame-001.webp`. Angle 1's 16 files represent retained source IDs 1-31 after the earlier cuts. Angle 2 contains only the 13 active frames and is named in its playback order: `frame-001.webp` is source ID 92, `frame-002.webp` is source ID 91, continuing down to source ID 76 at `frame-013.webp`. The sequence is 92, 91, 90, 89, then 84 down to 76; source IDs 85-88 remain excluded as requested. Frames 14 through 19 from the prior sequence have been removed. Angle 3 contains the former angle 2, with frames 26-28 removed; the remaining files are `frame-001.webp` to `frame-025.webp`.

Original frame IDs are preserved in angles 1 and 2, so gaps are expected. The sequence order, captions, and frame mapping are maintained in `src/app/tour-sequences.ts`.
