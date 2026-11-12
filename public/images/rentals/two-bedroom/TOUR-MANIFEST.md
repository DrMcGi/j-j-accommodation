# Two-bedroom rental tour sequence

Status: 172-frame sequence connected to the Room tours section. The first 28 frames from the extracted sequence have been reassigned to the full-property tour's second angle and are no longer used by the room tour.

## Current source map

| Source video | Current room-tour frames | Previous extracted frame numbers | Frames |
| --- | ---: | ---: | ---: |
| `IMG_4552.MOV` | `frame-0001.webp` to `frame-0027.webp` | 29-55 | 27 |
| `IMG_4554.MOV` | `frame-0028.webp` to `frame-0121.webp` | 56-149 | 94 |
| `IMG_4555.MOV` | `frame-0122.webp` to `frame-0150.webp` | 150-178 | 29 |
| `IMG_4556.MOV` | `frame-0151.webp` to `frame-0172.webp` | 179-200 | 22 |

The first 28 frames formerly numbered `frame-0001.webp` to `frame-0028.webp` are now stored in `public/images/tours/full-property/angle-2/`. They come from the start of `IMG_4552.MOV` and are part of the full-property walkthrough, not the two-bedroom room sequence.

## Frame format

- Sampled at approximately one frame per second, retaining the clip order.
- 540 x 960 WebP, quality 82.
- Source video is HDR/HLG; frames are tone-mapped to BT.709 for browser display.
- Original MOV files were left unchanged.

The two-bedroom player loads only the 172 numbered files in this folder. Refine the transitions and frame cuts with the owner before further changes.
