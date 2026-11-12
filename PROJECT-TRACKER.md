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
  - Services: daily cleaning, furnished accommodation, free Wi-Fi, 24/7 security, electricity included, solar backup during load-shedding
  - Setting: quiet farm environment
  - Check-in: 13:00; check-out: 10:00
  - WhatsApp/booking mobile: 071 544 0744; additional booking number: 081 868 8418; office: 013 541 1008
  - Email: jjgrootboom405@gmail.com

## In progress

- [x] Replace the Next.js starter landing page with a complete, responsive accommodation website.
- [x] Add optimized local photo assets and logo artwork.
- [x] Add working booking/contact links and clear directions/address information without inventing property facts.
- [x] Run lint and a production build; review desktop and mobile rendering in a browser.
- [x] Remove unused Next.js sample artwork and replace the starter favicon with J & J branding.
- [x] Review uploaded photos and select exterior, courtyard, kitchen, and lounge images for the site.
- [x] Replace the illustrated hero with a real exterior photograph and add accommodation photos.
- [x] Extract and curate a 328-frame, optimized sequence from the walkthrough video for scroll scrubbing.
- [x] Replace the temporary video player/gallery with a responsive scroll-controlled frame-by-frame tour.
- [x] Verify desktop/mobile scroll behavior, reverse scrolling, reduced-motion fallback, lint, and the final production build.
- [ ] Replace the portrait frame tour with a room-specific immersive 3D experience after the owner supplies suitable capture media; existing video frames cannot provide free-look geometry.
- [x] Add electricity-included and solar-backup details, without promising uninterrupted power.
- [x] Describe the quiet farm setting.
- [x] Set property directions to the exact shared-map pin while retaining the supplied postal/street address separately.
- [x] Add nearby links for KFC on the R555, Steelpoort Town, Tubatse Crossing, Tubatse Chrome Club, Thaba Moshate Casino, Burgersfort, and the nearby mines; mark route estimates as approximate.
- [ ] Create and verify a Google Business Profile with the owner when account access is available.

## Media handoff

- Original HEIC photos and MOV videos in `public/images/` are preserved locally and ignored by Git; optimized WebP website assets live under `public/images/media/`.
- No file was literally named `vid.mov`; `grootboom-farm-video.MOV` is being used as the intended 5:51 walkthrough source.
- The tour source was curated into 328 tone-mapped 540 × 960 WebP frames, sampled at one frame per second from the accommodation portion of the video. The current preview retains 227 frames after the owner’s requested cuts. It starts at the accommodation buildings and skips one clear mirror reflection of the camera operator; the full source video remains unchanged.
- Frame-cut requests (12 November 2026): skip even frames 2–50; skip 85–88 and resume at 89; skip 100, 101, 106, 108, 110–112, 176, 178–183, 186, 188–193, 197, 230–231, 242–247, and 253–254; also skip 51, 95–97, 109, 122–125, 130, 132, 140–142, 144, 146, 148, 150–153, and 155–171. Frame 154 is retained and followed by frame 172. Removed files can be restored from Git. Review this visual preview before committing.
- `src/app/scroll-tour.tsx` maps document scroll progress to the frame index and draws the nearest loaded frame to a canvas. Frames are fetched on demand; the reduced-motion mode remains a static poster.
- Current visual direction (12 November 2026): contained portrait frames on a warm neutral gallery surface, with tour guidance in its own desktop column and below the footage on mobile. Do not crop the source or place copy over the room image; previous full-bleed/blurred-side experiments were rejected by the owner.
- A reversible visual experiment is isolated on `feature/immersive-tour-experiment`; merge approved work back to `main` after Playwright and production checks. Playwright is installed as a development dependency for browser review.
- For a genuinely explorable 3D/Gaussian-splat room tour, request high-quality room capture (slow, overlapping video or a guided capture set per room/unit). Reusing the existing 328 portrait video frames can only scrub along the recorded camera path.
- Booking platform roadmap (not implemented yet): inventory by physical room/unit, room-type-specific media tours, date availability and booking holds, guest details and signed terms, payment gateway integration, server-verified payment webhooks, invoice/receipt generation, payment and booking notifications, and an administration calendar. Scope room/rate/deposit/cancellation/monthly-stay rules with the owner before implementing transactions.
- The client-preview baseline is committed as `6971ce9` and pushed to `origin/main`; original camera MOV/HEIC files are excluded. The scroll-tour work remains local on `feature/scroll-driven-room-tour`.
- The baseline is available at `https://github.com/DrMcGi/j-j-accommodation`; the scroll-tour branch has not been pushed.
- The scroll-tour is a frame-by-frame scrub along the recorded camera path, not free-look 3D or a 360° tour.
- The property pin is `-24.759645, 30.1716586`; the displayed address remains `336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133`.
- The mapped KFC on the R555 is roughly 5 km / 6–8 minutes by car; Burgersfort is roughly 22 km / 23 minutes by road. These are estimates, not guaranteed journey times. Mine links open map directions by named destination; exact mine-gate distances are not stated.
- Tubatse Chrome Club is listed as an 18-hole woodland golf course; the course profile also lists a clubhouse, restaurant, gym, pool, squash and tennis facilities. The route link searches by venue name, and visitors should confirm access before going.
- Thaba Moshate is Peermont's casino, hotel and convention resort in Burgersfort; its official page lists restaurants, a spa and entertainment. From the farm pin, the road-route estimate is about 18.4 km / 20 minutes; present this as roughly 18 km / 20–25 minutes.
- Tubatse Crossing's official site describes a regional shopping centre with 90+ stores, dining and entertainment at the R37/R555 intersection in Burgersfort.
- Business Profile setup remains pending and requires owner account access and Google's verification process.

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
- 12 November 2026: Verified the scroll-controlled tour changes frames and captions at desktop scroll positions, responds correctly when scrolling backward, and uses the static poster when reduced motion is enabled. Fixed the mobile grid so the frame display remains visible at 390px and 360px widths. `npm run lint` and the final `npm run build -- --webpack` both passed.
- 12 November 2026: Added solar/electricity and quiet-setting details, map directions to the pinned coordinates, and nearby KFC, town, Burgersfort, and mine destinations. `npm run lint` and `npm run build` passed; production page and map links were checked, with no horizontal overflow at 390px or 360px.
- 12 November 2026: Expanded the nearby section after identifying an 18-hole Tubatse Chrome Club golf course, Tubatse Crossing, and Thaba Moshate Casino Resort. Venue links use mapped directions and external venue/course information; estimates are qualified. Verified venue details against Hole19, Tubatse Crossing's site, and Peermont.
- 12 November 2026: Installed Playwright and Chromium for visual review. Replaced the full-viewport overlay experiment with an editorial split layout: full portrait frame in a neutral gallery column, tour guidance in a separate text column, and stacked media/copy on mobile. Removed image cropping, blur-fill backdrop, and image-overlay label. Playwright review at 1440×950 and 390×844 confirmed no horizontal overflow; mobile scroll moved progress from 4% to 69% and updated the scene caption. `npm run lint` passed. `npm run build -- --webpack` passed after sandbox worker-spawn restrictions required an elevated run. Ready to merge approved layout and tracker updates to `main`.
- 12 November 2026: Owner requested a shorter tour sequence in four rounds. Removed 112 unique source frames, kept 227 and updated scroll-to-frame mapping. Frame 89 is retained after omitting 85–88; frame 154 is retained and followed by 172; frame 174 is followed by 184. This is an uncommitted preview for owner review; restore or adjust cuts before committing if requested.
- 12 November 2026: Updated the WhatsApp redirects and displayed primary contact to 071 544 0744; the other booking and office numbers remain. Playwright confirmed all WhatsApp links target +27 71 544 0744, none of the skipped frame files were requested during the jump checks, and the page has no horizontal overflow. `npm run lint` passed. The changes remain uncommitted for owner review.

## Decisions and constraints

- The exact legal display name is **J & J Grootboom Farm Accommodation**; the folder/repository name is `j-j-accommodation`.
- Do not invent room counts, room-specific features, seasonal prices, booking policies, or availability.
- Keep the project in this folder and update this tracker at the end of each work session.
- The project folder uses a hyphenated name, so standard npm scripts work from the Windows PowerShell terminal.
