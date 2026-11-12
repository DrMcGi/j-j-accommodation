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
- **Booking:** 068 550 6349 · 081 868 8418 · 013 541 1008
- **Email:** [jjgrootboom405@gmail.com](mailto:jjgrootboom405@gmail.com)

The map directions open the property's pinned coordinates, separate from the written address above. Nearby-area links include KFC on the R555, Steelpoort Town, Tubatse Crossing in Burgersfort, Tubatse Chrome Club, Thaba Moshate Casino, and directions to Dwarsrivier Chrome Mine, Two Rivers Platinum Mine, and Mototolo Mine. Drive estimates are approximate and vary with route and traffic; confirm venue access and opening details before visiting.

Local venue references: [Tubatse Crossing](https://tubatsecrossingshopping.co.za/), [Tubatse Chrome Club course profile](https://www.hole19golf.com/courses/tubatse-chrome-club), and [Thaba Moshate Casino Resort](https://www.peermont.com/properties/thaba-moshate/). Rates and contact options link directly to WhatsApp, phone, email, and map directions. No availability, room-specific amenity, or policy details are assumed.

Google Business Profile setup is a future task and will require the owner's Google account access and business verification.

## Scroll-driven room tour

The room-tour section maps page scroll position to a curated 328-frame sequence from `grootboom-farm-video.MOV`, rendered into a canvas. Scrolling forward moves through the recorded walkthrough; scrolling backward revisits earlier frames. The WebP frames are sampled at one frame per second and stored in `public/images/tour-sequence/`, then loaded on demand. The complete portrait frame stays visible on a neutral gallery surface; guidance sits beside it on desktop and below it on mobile. Reduced-motion preferences show a static poster instead.

No upload was named `vid.mov`; the 5:51 `grootboom-farm-video.MOV` was treated as the intended scenery/room-tour source. This is a scroll-controlled view along the camera's recorded path, not free-look 3D or a 360° tour. The original HEIC and MOV uploads remain local and are ignored by Git; the website uses optimized WebP assets.

Room-specific galleries, availability, online bookings, document signing, payment processing, invoicing, notifications, and an admin calendar are future project phases. An explorable 3D or Gaussian-splat tour will require suitable capture media for each room; the existing frame sequence cannot produce geometry or free-look navigation. Playwright is a development dependency and is used to review desktop and mobile presentation.

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
