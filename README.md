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
- **Services:** Daily cleaning, fully furnished accommodation, free Wi-Fi, and 24/7 security
- **Check-in:** 13:00
- **Check-out:** 10:00
- **Address:** 336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133
- **Booking:** 068 550 6349 · 081 868 8418 · 013 541 1008
- **Email:** [jjgrootboom405@gmail.com](mailto:jjgrootboom405@gmail.com)

The website's rates and contact options link directly to WhatsApp, phone, email, and map directions. No availability, room-specific amenity, or policy details are assumed.

## Video handoff

The room-tour section uses selected farm and accommodation photos, a bedroom still from `grootboom-farm-video.MOV`, and a short, optimized living-area preview from `IMG_4532.MOV` at `public/videos/living-area-preview.mp4`. No upload was named `vid.mov`, so the 5:51 `grootboom-farm-video.MOV` was treated as the requested scenery/room-tour source. The original HEIC and MOV uploads remain unchanged in `public/images/`; optimized WebP copies are in `public/images/media/`. This is a photo/video preview, not an interactive 3D or 360° tour. Add future web-ready clips under `public/videos/` and use accessible `<video controls playsInline preload="none">` elements with poster images. Do not serve or commit the multi-gigabyte camera originals; use a suitable media host for larger videos or 3D assets.

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
