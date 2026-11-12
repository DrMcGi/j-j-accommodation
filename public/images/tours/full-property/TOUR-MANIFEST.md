# Full-property three-angle tour

Status: 63-frame exterior walkthrough connected to the Room tours selector. It plays the original approach, a reverse-ordered pass from the courtyard, and the alternate Unit 3 exterior angle.

## Playback order

| Playback angle | Source | Folder | Active frames |
| --- | --- | --- | ---: |
| Angle 1 | Original walkthrough source IDs 1-31 after approved cuts | `angle-1/frame-001.webp` to `frame-016.webp` | 16 |
| Angle 2 | Original walkthrough source IDs 92 down to 70, in reverse order | `angle-2/frame-001.webp` to `frame-048.webp` | 19 active of 48 |
| Angle 3 | `IMG_4552.MOV`, the first 28 frames moved from the two-bedroom sequence | `angle-3/frame-001.webp` to `frame-028.webp` | 28 |

**Total active playback:** 63 frames in the order angle 1 -> angle 2 -> angle 3.

All three angle folders now use consecutive filenames beginning at `frame-001.webp`. Angle 1's 16 files represent retained source IDs 1-31 after the earlier cuts. Angle 2 stores the 48 retained frames from source IDs 32-94 in ascending source order under `frame-001.webp` to `frame-048.webp`; playback maps the chosen frames in reverse source order: 92, 91, 90, 89, then 84 down to 70. Source IDs 85-88 remain excluded as requested. The remaining 29 angle-2 files are stored for later refinement but are not in the current playback. Angle 3 contains the former angle 2, renumbered `frame-001.webp` to `frame-028.webp`.

Original frame IDs are preserved in angles 1 and 2, so gaps are expected. The sequence order, captions, and frame mapping are maintained in `src/app/tour-sequences.ts`.
