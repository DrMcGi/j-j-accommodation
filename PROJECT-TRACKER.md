# J & J Grootboom Farm Accommodation — Project Progress

This file is the durable project handoff. Update it when work is completed so the project can be resumed without losing context.

## Completed

- [x] Used the clearer water-bottle sticker photo to refine the full-logo wordmark; replaced the fuzzy traced lettering with crisp, editable SVG text.
- [x] Increased the weight of “GROOT” and “FARM” again; retained regular “BOOM”, widely spaced “ACCOMMODATION”, and the tight “GROOTBOOM” join.
- [x] Created a transparent, wordmark-only SVG using the exact text group from the full logo.
- [x] Updated the website header and footer to show the full logo SVG with its exact wordmark crop beside it.
- [x] Kept both SVG logo assets transparent and exported 3× white-background PNG copies for the full logo and compact mark.
- [x] Reviewed the supplied `public/docs/j and j logo.pdf` and confirmed it embeds a 365 × 363 JPEG, not source vector artwork.
- [x] Recreated the house emblem, intertwined J & J monogram, and "Grootboom Farm Accommodation" lettering as transparent, two-color scalable SVG paths.
- [x] Added the full logo, compact emblem, and branded app icon; wired the emblem into the site header and footer.
- [x] Documented the SVG assets and their raster-reference limitation in the README.
- [x] Removed the previous `j&j-accommodation` starter project at the owner's request.
- [x] Created the `j-j-accommodation` project using `npx create-next-app` with Next.js, TypeScript, Tailwind CSS, and ESLint.
- [x] Initialized a local Git repository; the Create Next App scaffold's initial commit is present.
- [x] Recorded the business facts supplied by the owner:
  - Legal name: J & J Grootboom Farm Accommodation
  - Address: 336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133
  - Overnight: R850
  - Monthly bachelor: R7,500
  - Monthly two-bedroom: R13,500
  - Services: daily cleaning, furnished accommodation, free Wi-Fi, 24/7 security
  - Check-in: 13:00; check-out: 10:00
  - Booking phones: 068 550 6349, 081 868 8418, 013 541 1008
  - Email: jjgrootboom405@gmail.com

## In progress

- [x] Replace the Next.js starter landing page with a complete, responsive accommodation website.
- [x] Add original local visual assets and clear placeholders for the owner's future room/scenery videos.
- [x] Add working booking/contact links and clear directions/address information without inventing property facts.
- [x] Run lint and a production build; review desktop and mobile rendering in a browser.
- [x] Remove unused Next.js sample artwork and replace the starter favicon with J & J branding.
- [x] Review uploaded photos and select exterior, courtyard, kitchen, and lounge images for the site.
- [x] Replace the illustrated hero with a real exterior photograph and add an accessible gallery with a short video preview and a bedroom still extracted from the walkthrough.
- [x] Run lint/build and verify responsive media rendering.

## Media handoff

- Original HEIC photos and MOV videos in `public/images/` are preserved unchanged.
- Optimized photos for the hero/gallery live in `public/images/media/`: farm exterior, courtyard, kitchen, lounge poster, and a bedroom frame.
- A 12-second, 720 × 1280 H.264 preview from `IMG_4532.MOV` is available at `public/videos/living-area-preview.mp4` (~1.8 MB).
- The website uses a real farm exterior photo in the hero and shows the courtyard, kitchen, and bedroom frame beside a native-controls living-area video player.
- A bedroom frame at 235 seconds from the 4K HDR `grootboom-farm-video.MOV` was tone-mapped to WebP for the gallery. The source remains unchanged and is not served directly; other sampled stills were rejected for poor framing or harsh sunlight.
- No file was literally named `vid.mov`; `grootboom-farm-video.MOV` was treated as the intended scenery/room-tour video based on its content and duration.
- The embedded preview is a regular video only; it does not claim to be a 3D, 360°, or live-exploration experience.
- The earlier `tour-frame-*.webp` candidates remain available but are not used in the page.

## Logo handoff

- Full logo: `public/images/j-and-j-grootboom-farm-logo.svg`
- Full logo PNG: `public/images/j-and-j-grootboom-farm-logo.png` (3×, white background)
- Compact house/monogram: `public/images/j-and-j-grootboom-farm-mark.svg`
- Compact mark PNG: `public/images/j-and-j-grootboom-farm-mark.png` (3×, white background)
- Wordmark-only SVG: `public/images/j-and-j-grootboom-farm-wordmark.svg` (transparent crop from the full logo)
- Favicon: `src/app/icon.svg` (square viewBox with the emblem centered).
- The header and footer display the full logo SVG plus the wordmark-only SVG beside it; `src/app/icon.svg` remains the separate browser/app icon.
- Both logo SVGs have transparent backgrounds; their PNG copies use solid white backgrounds.
- The full logo uses editable SVG text for the wordmark; the house, monogram, compact mark, and app icon use vector paths.
- The full logo and exact wordmark crop sit side by side in the header/footer.
- The supplied PDF remains unchanged in `public/docs/`.
- The SVG is a scalable vector trace of the embedded JPEG. It cannot reproduce lost original vector geometry exactly; replace it with an original SVG, AI, EPS, or CDR master if one becomes available.
- The full logo's wordmark uses the user's bottle-sticker photo as reference and is actual editable SVG text. The house and monogram remain traced vector paths.
- Verified with XML parsing, a browser preview of the full logo, and the website header integration.

## Latest verification

- 11 November 2026: `npm run lint` and `npm run build` passed after the logo integration.
- Confirmed desktop logo/header rendering and the final logo is an SVG containing two-color vector paths on a transparent background.
- 11 November 2026: increased the weight of “GROOT” and “FARM” again, clarified that the icon is emblem-only, regenerated both 3× white-background PNG copies, verified all SVG/PNG assets, and passed `npm run lint` and `npm run build`.
- 11 November 2026: added a transparent SVG crop of the full-logo wordmark and verified it is pixel-identical to the logo.
- 11 November 2026: retained the full logo and added the exact wordmark crop beside it in the header/footer; `src/app/icon.svg` remains the browser/app icon.
- Confirmed both branding assets render side by side in the production header at desktop and mobile widths without horizontal overflow; `npm run lint` and `npm run build` passed.
- Confirmed the production header uses one full-logo image, stays within the mobile viewport, and passed `npm run lint` and `npm run build`.
- Reviewed photo crops and video frames; selected the exterior, courtyard, kitchen, and bedroom assets. Integrated them with a 12-second optimized living-area video preview; original uploads remain untouched.
- 12 November 2026: `npm run lint` passed. After the final media update, the default Turbopack build timed out in its Tailwind CSS worker; `npm run build -- --webpack` completed successfully. Production smoke tests returned HTTP 200 for the homepage and selected media; mobile checks confirmed the video plays and the page has no horizontal overflow.

## Decisions and constraints

- The exact legal display name is **J & J Grootboom Farm Accommodation**; the folder/repository name is `j-j-accommodation`.
- Do not invent room counts, room-specific features, seasonal prices, booking policies, or availability.
- Keep the project in this folder and update this tracker at the end of each work session.
- The project folder uses a hyphenated name, so standard npm scripts work from the Windows PowerShell terminal.
