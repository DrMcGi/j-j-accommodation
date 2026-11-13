# J & J Grootboom Farm Accommodation

The public website for overnight and monthly accommodation at Grootboom Farm, Steelpoort. Built with Next.js, React, TypeScript, and Tailwind CSS.

## Run locally

```powershell
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run the quality checks before sharing or deploying:

```powershell
npm run lint
npm run build
```

## Website content

- **Overnight:** R850 per night
- **Bachelor:** R7,500 per month
- **Two bedroom:** R13,500 per month
- **Services:** Daily cleaning, fully furnished accommodation, free Wi-Fi, 24/7 security, electricity included, and solar backup to help during load-shedding
- **Setting:** A quiet farm environment
- **Check-in:** 13:00
- **Check-out:** 10:00
- **Address:** 336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133
- **Booking / WhatsApp:** 071 544 0744 · 081 868 8418 · Office: 013 541 1008
- **Email:** [jjgrootboom405@gmail.com](mailto:jjgrootboom405@gmail.com)

The map directions open the property's pinned coordinates, separate from the written address above. Nearby-area links include KFC on the R555, Steelpoort Town, Tubatse Crossing in Burgersfort, Tubatse Chrome Club, Thaba Moshate Casino, and directions to Dwarsrivier Chrome Mine, Two Rivers Platinum Mine, and Mototolo Mine. Drive estimates are approximate and vary with route and traffic; confirm venue access and opening details before visiting.

Local venue references: [Tubatse Crossing](https://tubatsecrossingshopping.co.za/), [Tubatse Chrome Club course profile](https://www.hole19golf.com/courses/tubatse-chrome-club), and [Thaba Moshate Casino Resort](https://www.peermont.com/properties/thaba-moshate/). Rates and contact options link directly to WhatsApp, phone, email, and map directions. No availability, room-specific amenity, or policy details are assumed.

Google Business Profile setup is a future task and will require the owner's Google account access and business verification.

## Cinematic property experience and room tours

The main accommodation story is a sticky, scroll-controlled walk through the real rooms, curated to 88 frames from the two-frames-per-second extraction of `IMG_4532.MOV`. Website chapters follow the camera from the kitchen and living area into the bedroom, with held views while visitors read. See [`TOUR-MANIFEST.md`](./public/images/experience/room-journey/TOUR-MANIFEST.md) for the sequence and chapter map.

The Room tours section offers three scroll-controlled experiences. The two-bedroom rental contains 112 curated frames; the bachelor room tour contains 122 curated interior frames from the original walkthrough; the full-property tour contains 54 frames across three exterior angles. Frames load on demand as the visitor scrolls, and reduced-motion preferences show a static poster. The bachelor sequence follows the entry, kitchen, living area, bedroom, and bathroom without the exterior footage.

Open **Room tours** in the site navigation and select a tour. The section opens with the full-property walkthrough selected. The full-property tour plays angle 1, the reverse-ordered angle 2, then angle 3. Its middle pass follows retained source frames 92 down to 76 in reverse order. Frame mapping and approved cuts are maintained in `src/app/tour-sequences.ts` and `PROJECT-TRACKER.md`.

No upload was named `vid.mov`; the 5:51 `grootboom-farm-video.MOV` was treated as the intended original room-tour source. These are scroll-controlled views along recorded camera paths, not free-look 3D or 360-degree tours. Original HEIC and MOV uploads remain local and are ignored by Git; the website uses optimized WebP assets. A genuinely explorable 3D or Gaussian-splat tour will require suitable capture media.

## Booking platform

The site now includes live availability, booking requests, customer accounts, an administration calendar, unit inventory and maintenance blocks, booking review, digital agreements with customer and management signatures, Ozow One API hosted checkout, automatic paid receipts, printable booking invoices, and email notifications through a queued outbox. The 9 bachelor and 4 two-bedroom units are shared inventory for overnight and monthly stays. Public requests remain unconfirmed until management assigns a physical unit and confirms the final amount.

The integration code is ready for a configured staging environment. It is not live yet: no Supabase project, Ozow merchant/site credentials, verified email sender, public domain or approved final rental terms were supplied. Setup, environment keys, initial administrator setup, webhook configuration, signature workflow and release checks are documented in [BOOKING-PLATFORM.md](./BOOKING-PLATFORM.md). Copy `.env.example` to the chosen host's secret settings; do not commit credentials. Apply the SQL migration in `supabase/migrations/` to a separate staging project and exercise the full booking-to-payment flow before enabling production.

Monthly prices come from the current public site. Management enters the final price before checkout, so partial-month calculations, deposits and refunds are not guessed. Overnight is currently shown at R850 per night; confirm whether that price is per room or per bed before automating it. The supplied `GUEST RULES.pdf` provides stay rules. Seven scanned pages of the residential lease template are stored locally in the Git-ignored `private-documents/lease-template-scans/` folder; page 16 was not supplied. The generated agreement is a versioned draft that combines the booking, house rules and management-entered deposit/cancellation/legal lessor terms; obtain management/legal approval before sending real agreements. Playwright is a development dependency and is used to review desktop and mobile presentation.

## Two-bedroom rental tour

The 112-frame sequence is saved in `public/images/rentals/two-bedroom/tour-sequence/`. The retained Angle 3 sequence uses 25 frames from the former two-bedroom exterior pass. The room tour uses the requested retained sections from all four source clips, with a new consecutive frame numbering for playback. See its manifest for the complete frame mapping and cuts. See [`TOUR-MANIFEST.md`](./public/images/rentals/two-bedroom/TOUR-MANIFEST.md) for its source map.

## Bachelor room tour

The bachelor tour uses 122 curated interior frames from original source IDs above 94, stored in `public/images/rentals/bachelor/tour-sequence/`. Previously approved source-frame cuts remain in effect. See [`TOUR-MANIFEST.md`](./public/images/rentals/bachelor/TOUR-MANIFEST.md) for its scene ranges and source mapping.

The three full-property angles are organized under `public/images/tours/full-property/`; see its [tour manifest](./public/images/tours/full-property/TOUR-MANIFEST.md).

## Logo assets

- Full vector logo: [`public/images/j-and-j-grootboom-farm-logo.svg`](./public/images/j-and-j-grootboom-farm-logo.svg)
- Full logo, white-background PNG: [`public/images/j-and-j-grootboom-farm-logo.png`](./public/images/j-and-j-grootboom-farm-logo.png)
- Wordmark-only crop from the full logo: [`public/images/j-and-j-grootboom-farm-wordmark.svg`](./public/images/j-and-j-grootboom-farm-wordmark.svg)
- House and monogram for compact placements: [`public/images/j-and-j-grootboom-farm-mark.svg`](./public/images/j-and-j-grootboom-farm-mark.svg)
- Compact mark, white-background PNG: [`public/images/j-and-j-grootboom-farm-mark.png`](./public/images/j-and-j-grootboom-farm-mark.png)
- The header, footer, and browser icon use the traced emblem.

Both logo SVGs and the cropped wordmark have transparent backgrounds. The PNG copies are exported at 3× their SVG dimensions with solid white backgrounds for print and other use cases. The cropped wordmark reuses the full logo's exact editable SVG text, preserving its red “GROOTBOOM”, charcoal “FARM”, and widely spaced charcoal “ACCOMMODATION”. The website header and footer show the full logo SVG with the matching wordmark crop alongside it. `src/app/icon.svg` remains the separate compact app/browser icon. The supplied `public/docs/j and j logo.pdf` contains a JPEG image rather than original editable vector paths; the house and monogram are traced as scalable paths. Font rendering for the editable text can vary slightly across systems. The artwork is a reconstruction of the supplied reference, not the lost original vector source; tiny emblem details may differ. If a design master in SVG, AI, EPS, or CDR format is found later, use that master instead.

The header and footer retain `j-and-j-grootboom-farm-logo.svg` and add `j-and-j-grootboom-farm-wordmark.svg` beside it. `src/app/icon.svg` is kept separate for browser/app icon use.

## Progress notes

See [PROJECT-TRACKER.md](./PROJECT-TRACKER.md) for completed work, media handoff notes, and remaining tasks.
