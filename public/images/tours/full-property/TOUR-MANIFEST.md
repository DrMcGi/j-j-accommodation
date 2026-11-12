# Full-property two-angle tour

Status: 92-frame exterior walkthrough connected to the Room tours selector. It plays the first exterior angle, then the alternate angle. Original interior frames after source ID 94 are now used by the separate bachelor room tour.

## Playback order

| Segment | Source | Folder | Frames |
| --- | --- | --- | ---: |
| Angle 1 | Original walkthrough source IDs 1-94, preserving the approved cuts | `angle-1/` | 64 |
| Angle 2 | `IMG_4552.MOV`, the first 28 frames previously at the start of the two-bedroom sequence | `angle-2/` | 28 |

**Total:** 92 frames in the order angle 1 -> angle 2.

Angle 1 contains 64 files because earlier owner-approved cuts remain in force: even source frames 2-50, source frame 51, and frames 85-88 are excluded. Filenames retain original source IDs, so gaps are expected. The second angle comes from the exterior portion of `IMG_4552.MOV`.

The sequence mapping and angle captions are maintained in `src/app/tour-sequences.ts`. This is a scroll sequence along recorded camera paths, not a free-look 3D reconstruction.
