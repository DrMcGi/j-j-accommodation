# Full-property multi-angle tour

Status: 252-frame scroll tour connected to the Room tours selector. The experience plays the first exterior pass, a second exterior angle, then the remaining frames from the original property walkthrough.

## Playback order

| Segment | Source | Files in this folder | Frames |
| --- | --- | ---: | ---: |
| Angle 1 | Original walkthrough source frames 1-94, preserving the already-approved skips | `angle-1/` | 64 |
| Angle 2 | `IMG_4552.MOV`, the first 28 frames previously included at the start of the two-bedroom sequence | `angle-2/frame-0001.webp` to `frame-0028.webp` | 28 |
| Continuation | Retained original walkthrough source frames greater than 94, preserving approved skips | `continuation/` | 160 |

**Total:** 252 frames in the order angle 1 -> angle 2 -> continuation.

Angle 1's requested source range 1-94 contains 64 files because earlier owner-approved frame cuts are preserved: even frames 2-50, frame 51, and frames 85-88 remain excluded. The filenames retain the original source frame numbers, so gaps are expected. The continuation also keeps its original source frame numbers.

The continuation follows the exterior/walkway footage into the property interior. The tour captions identify the first and second camera angles in sequence. The source mapping and progress thresholds are maintained in `src/app/tour-sequences.ts`.

All files are tone-mapped WebP frames. Original video uploads remain unchanged. This is a scroll sequence along the recorded camera paths, not a free-look 3D reconstruction.
