# Two-bedroom rental tour sequence

Status: 112-frame sequence connected to the Room tours section. The original 172-frame room sequence has been curated using the requested frame cuts and relabeled consecutively for playback.

## Playback order and relabeling

The following table maps each new output range to its frame number in the sequence before this edit. Any omitted input numbers are intentional skips.

| New playback frames | Previous sequence frames | Count |
| --- | ---: | ---: |
| `frame-0001.webp` to `frame-0003.webp` | 10-12 | 3 |
| `frame-0004.webp` to `frame-0044.webp` | 28-68 | 41 |
| `frame-0045.webp` | 72 | 1 |
| `frame-0046.webp` to `frame-0069.webp` | 78-101 | 24 |
| `frame-0070.webp` | 103 | 1 |
| `frame-0071.webp` | 105 | 1 |
| `frame-0072.webp` | 106 | 1 |
| `frame-0073.webp` to `frame-0096.webp` | 126-149 | 24 |
| `frame-0097.webp` to `frame-0112.webp` | 157-172 | 16 |

Thus playback starts at old frame 10, plays through 12, jumps to 28-68, retains 72, jumps to 78-101, retains 103, 105, and 106, jumps to 126-149, then resumes at 157 through the end. Old frames 1-9, 13-27, 69-71, 73-77, 102, 104, 107-125, and 150-156 are excluded.

The prior sequence's source-video mapping was: old frames 1-27 from `IMG_4552.MOV` extracted frames 29-55; old frames 28-121 from `IMG_4554.MOV` extracted frames 56-149; old frames 122-150 from `IMG_4555.MOV` extracted frames 150-178; and old frames 151-172 from `IMG_4556.MOV` extracted frames 179-200. The new numbering follows the retained playback order above.

## Frame format

- Sampled at approximately one frame per second, retaining the clip order.
- 540 x 960 WebP, quality 82.
- Source video is HDR/HLG; frames are tone-mapped to BT.709 for browser display.
- Original MOV files were left unchanged.

The two-bedroom player loads only the 112 consecutively numbered files in this folder. `src/app/tour-sequences.ts` defines the player count and scene transitions.
