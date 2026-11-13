import Image from "next/image";
import CinematicExperience from "./cinematic-experience";
import ScrollTour from "./scroll-tour";

type IconName =
  | "arrow"
  | "bed"
  | "calendar"
  | "check"
  | "clock"
  | "mail"
  | "moon"
  | "pin"
  | "shield"
  | "sparkles"
  | "sun"
  | "wifi";

function Icon({
  name,
  className,
}: {
  name: IconName;
  className?: string;
}) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),
    bed: (
      <>
        <path d="M3 19v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
        <path d="M3 15h18M5 9V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3M13 9V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 19v2m18-2v2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 11h18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    mail: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    moon: <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />,
    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3ZM19 14l1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14ZM5 2l.8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
      </>
    ),
    wifi: (
      <>
        <path d="M5 12.5a11 11 0 0 1 14 0M8.5 16a5.5 5.5 0 0 1 7 0M12 20h.01" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

const services = [
  {
    icon: "sparkles",
    title: "Clean, every day",
    description:
      "Daily cleaning is part of the stay, so you can settle in and feel at home.",
  },
  {
    icon: "bed",
    title: "Fully furnished",
    description:
      "Furnished accommodation for an easy overnight visit or a longer stay.",
  },
  {
    icon: "wifi",
    title: "Free Wi-Fi",
    description:
      "Stay connected with complimentary Wi-Fi while you are with us.",
  },
  {
    icon: "shield",
    title: "Security, day and night",
    description:
      "24/7 security helps you feel at ease, at any time of day.",
  },
  {
    icon: "sun",
    title: "Electricity included",
    description:
      "Electricity is included, with solar backup to help keep you powered during load-shedding.",
  },
  {
    icon: "moon",
    title: "A peaceful farm setting",
    description:
      "Enjoy a quiet stay at Grootboom Farm, away from the bustle of town.",
  },
] as const;

type StayOption = {
  number: string;
  name: string;
  period: string;
  price: string;
  description: string;
  highlights: string[];
  message: string;
  featured?: boolean;
};

const stays: StayOption[] = [
  {
    number: "01",
    name: "Overnight stay",
    period: "Per night",
    price: "R850",
    description: "For a comfortable night in Steelpoort.",
    highlights: ["Fully furnished", "Daily cleaning", "Free Wi-Fi"],
    message: "Hello, I would like to enquire about the R850 overnight stay.",
  },
  {
    number: "02",
    name: "Bachelor",
    period: "Per month",
    price: "R7,500",
    description: "A furnished monthly bachelor option.",
    highlights: ["Monthly accommodation", "Daily cleaning", "Free Wi-Fi"],
    message: "Hello, I would like to enquire about the R7,500 monthly bachelor accommodation.",
    featured: true,
  },
  {
    number: "03",
    name: "Two bedroom",
    period: "Per month",
    price: "R13,500",
    description: "Two-bedroom monthly accommodation.",
    highlights: ["Two-bedroom accommodation", "Daily cleaning", "Free Wi-Fi"],
    message: "Hello, I would like to enquire about the R13,500 monthly two-bedroom accommodation.",
  },
];

const contactNumbers = [
  { display: "071 544 0744", href: "tel:+27715440744" },
  { display: "081 868 8418", href: "tel:+27818688418" },
  { display: "013 541 1008", href: "tel:+27135411008" },
];

const address = "336KT Grootboom Farm, Corner Lannex R555, Steelpoort 1133";
const propertyCoordinates = "-24.759645,30.1716586";

function directionsFromProperty(destination: string) {
  const params = new URLSearchParams({
    api: "1",
    origin: propertyCoordinates,
    destination,
    travelmode: "driving",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(propertyCoordinates)}`;
const nearbyMines = [
  {
    name: "Dwarsrivier Chrome Mine",
    href: directionsFromProperty("Dwarsrivier Chrome Mine, Limpopo, South Africa"),
  },
  {
    name: "Two Rivers Platinum Mine",
    href: directionsFromProperty("Two Rivers Platinum Mine, Limpopo, South Africa"),
  },
  {
    name: "Mototolo Mine",
    href: directionsFromProperty("Mototolo Mine, Limpopo, South Africa"),
  },
];
const whatsappNumber = "27715440744";
const bookingUrl = `https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20would%20like%20to%20enquire%20about%20booking%20accommodation.`;

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <div className="welcome-strip">
        <span>A warm welcome in Steelpoort</span>
        <span className="welcome-strip-note">J &amp; J Grootboom Farm Accommodation</span>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <a aria-label="J & J Grootboom Farm Accommodation home" className="brand" href="#home">
            <Image
              alt=""
              aria-hidden="true"
              className="brand-logo"
              height={69}
              priority
              src="/images/j-and-j-grootboom-farm-logo.svg"
              width={64}
            />
            <Image
              alt=""
              aria-hidden="true"
              className="brand-logo"
              height={28}
              priority
              src="/images/j-and-j-grootboom-farm-wordmark.svg"
              style={{ width: "clamp(130px, 36vw, 200px)" }}
              width={200}
            />
          </a>

          <nav aria-label="Main navigation" className="main-nav">
            <a href="#stays">Our stays</a>
            <a href="#services">What’s included</a>
            <a href="#tour">Room tours</a>
            <a href="#location">Find us</a>
          </nav>

          <a className="header-cta" href="#contact">
            Get in touch <Icon name="arrow" />
          </a>
        </div>
      </header>

      <main id="main">
        <CinematicExperience>
        <section
          aria-labelledby="hero-title"
          className="hero"
          data-cinematic-chapter
          data-cinematic-label="A stay at your pace"
          id="home"
        >
          <div className="hero-inner page-shell">
            <div className="hero-copy">
              <p className="eyebrow">
                <span className="eyebrow-dot" />
                FARM ACCOMMODATION · STEELPOORT
              </p>
              <h1 id="hero-title">
                A place to
                <br />
                <span>slow down</span>
                <br />
                and feel at home.
              </h1>
              <p className="hero-description">
                Whether it’s a night away or a longer stay, find a warm,
                furnished place to settle in at Grootboom Farm.
              </p>
              <div className="hero-actions">
                <a className="button button-dark" href="#stays">
                  Explore accommodation <Icon name="arrow" />
                </a>
                <a className="text-link" href="#location">
                  <Icon name="pin" /> Steelpoort, Limpopo
                </a>
              </div>
              <div className="hero-note">
                <span aria-hidden="true" className="hero-note-icon">
                  <Icon name="check" />
                </span>
                <p>
                  <strong>Stay your way</strong>
                  <span>Overnight and monthly options available</span>
                </p>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-image-frame">
                <Image
                  alt="The furnished accommodation buildings at Grootboom Farm"
                  className="hero-image"
                  height="1000"
                  priority
                  src="/images/media/farm-exterior-hero.webp"
                  sizes="(max-width: 680px) calc(100vw - 56px), (max-width: 960px) 42vw, 46vw"
                  width="900"
                />
                <div className="hero-image-caption">
                  <span className="caption-kicker">YOUR NEXT STAY</span>
                  <span>A little room to breathe.</span>
                </div>
              </div>
              <div className="hero-stamp" aria-label="A warm welcome, day and night">
                <span>YOUR STAY,</span>
                <strong>your pace.</strong>
                <span className="stamp-star">✳</span>
              </div>
              <span aria-hidden="true" className="hero-sparkle sparkle-one">✳</span>
              <span aria-hidden="true" className="hero-sparkle sparkle-two">✳</span>
            </div>
          </div>

          <div className="hero-bottom page-shell">
            <p>A little longer, or just for the night.</p>
            <a href="#stays">
              Find the right stay <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        <section aria-label="Check-in and check-out times" className="arrival-bar">
          <div className="arrival-inner page-shell">
            <div className="arrival-label">
              <Icon name="calendar" />
              <span>Plan your arrival</span>
            </div>
            <div className="arrival-time">
              <span>CHECK-IN</span>
              <strong>13:00</strong>
            </div>
            <span aria-hidden="true" className="arrival-divider" />
            <div className="arrival-time">
              <span>CHECK-OUT</span>
              <strong>10:00</strong>
            </div>
            <a className="arrival-link" href="#contact">
              Ask us a question <Icon name="arrow" />
            </a>
          </div>
        </section>

        <section
          aria-labelledby="stays-title"
          className="stays-section section-space"
          data-cinematic-chapter
          data-cinematic-label="Find your stay"
          id="stays"
        >
          <div className="page-shell">
            <div className="section-heading">
              <div>
                <p className="eyebrow eyebrow-green">FIND YOUR FIT</p>
                <h2 id="stays-title">
                  Here for a night.
                  <br />
                  <span>Or here for a while.</span>
                </h2>
              </div>
              <p className="section-intro">
                Choose an overnight stay or a monthly home base. Get in touch
                and we’ll help with your booking enquiry.
              </p>
            </div>

            <div className="stays-grid">
              {stays.map((stay) => (
                <article
                  className={`stay-card${stay.featured ? " stay-card-featured" : ""}`}
                  key={stay.number}
                >
                  <div className="stay-card-top">
                    <span className="stay-number">{stay.number}</span>
                    <Icon className="stay-card-icon" name="bed" />
                  </div>
                  <p className="stay-period">{stay.period}</p>
                  <h3>{stay.name}</h3>
                  <div className="stay-price">
                    <strong>{stay.price}</strong>
                    <span>{stay.period === "Per night" ? "/ night" : "/ month"}</span>
                  </div>
                  <p className="stay-description">{stay.description}</p>
                  <ul className="stay-highlights">
                    {stay.highlights.map((highlight) => (
                      <li key={highlight}>
                        <Icon name="check" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                  <a
                    className={`button ${stay.featured ? "button-light" : "button-outline"}`}
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(stay.message)}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Enquire about this stay <Icon name="arrow" />
                  </a>
                </article>
              ))}
            </div>

            <p className="rates-note">
              Have a question about a rate or a longer stay?{" "}
              <a href="#contact">Talk to us directly.</a>
            </p>
          </div>
        </section>

        <section
          aria-labelledby="services-title"
          className="services-section section-space"
          data-cinematic-chapter
          data-cinematic-label="Settle in"
          id="services"
        >
          <div className="page-shell">
            <div className="services-heading">
              <p className="eyebrow eyebrow-light">THE LITTLE THINGS, TAKEN CARE OF</p>
              <h2 id="services-title">
                Settle in.
                <br />
                We’ll take care of the rest.
              </h2>
              <p>
                All the essentials for a more comfortable stay, whether you’re
                here overnight or by the month.
              </p>
            </div>

            <div className="services-grid">
              {services.map((service, index) => (
                <article className="service-item" key={service.title}>
                  <span className="service-number">0{index + 1}</span>
                  <span className="service-icon">
                    <Icon name={service.icon} />
                  </span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>

            <div className="services-footer">
              <Icon name="sparkles" />
              <p>Thoughtful everyday comforts, included in your stay.</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="location-title"
          className="location-section section-space"
          data-cinematic-chapter
          data-cinematic-label="Find us and get in touch"
          id="location"
        >
          <div className="page-shell location-grid">
            <div className="location-copy">
              <p className="eyebrow eyebrow-light">
                <Icon name="pin" /> COME FIND US
              </p>
              <h2 id="location-title">
                Your stay,
                <br />
                <span>at Grootboom Farm.</span>
              </h2>
              <p className="location-description">
                We’re in Steelpoort, Limpopo. Directions open the property’s
                pinned map location; our supplied address is shown separately
                below.
              </p>
              <a
                className="button button-light location-map-link"
                href={directionsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <Icon name="pin" /> Get directions <Icon name="arrow" />
              </a>
              <div className="address-card">
                <span className="address-icon">
                  <Icon name="pin" />
                </span>
                <p>
                  <span>OUR ADDRESS</span>
                  <strong>{address}</strong>
                </p>
              </div>
            </div>

            <div className="contact-card" id="contact">
              <p className="eyebrow eyebrow-green">WE’RE HERE TO HELP</p>
              <h3>Let’s get you settled.</h3>
              <p className="contact-intro">
                Questions or ready to enquire? Reach out—we’d love to hear
                from you.
              </p>

              <div className="contact-list">
                <div className="contact-row">
                  <span className="contact-icon">
                    <Icon name="clock" />
                  </span>
                  <p>
                    <span>ARRIVAL &amp; DEPARTURE</span>
                    <strong>Check-in 13:00 · Check-out 10:00</strong>
                  </p>
                </div>
                <div className="contact-row">
                  <span className="contact-icon">
                    <Icon name="bed" />
                  </span>
                  <p>
                    <span>CALL TO BOOK</span>
                    {contactNumbers.map((number) => (
                      <a href={number.href} key={number.display}>
                        {number.display}
                      </a>
                    ))}
                  </p>
                </div>
                <div className="contact-row">
                  <span className="contact-icon">
                    <Icon name="mail" />
                  </span>
                  <p>
                    <span>EMAIL US</span>
                    <a href="mailto:jjgrootboom405@gmail.com">
                      jjgrootboom405@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <a
                className="button button-dark contact-whatsapp"
                href={bookingUrl}
                rel="noreferrer"
                target="_blank"
              >
                Send a WhatsApp enquiry <Icon name="arrow" />
              </a>
            </div>
          </div>

          <section
            aria-labelledby="nearby-title"
            className="nearby-section page-shell"
          >
            <div className="nearby-heading">
              <div>
                <p className="eyebrow eyebrow-light">AROUND THE AREA</p>
                <h3 id="nearby-title">
                  Local essentials and places worth exploring.
                </h3>
              </div>
              <p className="nearby-note">
                Drive distances and times are estimates; routes and traffic can
                change.
              </p>
            </div>

            <div className="nearby-grid">
              <article className="nearby-card">
                <span className="nearby-category">FOOD &amp; TAKEAWAYS</span>
                <h4>KFC on the R555</h4>
                <p>About 5 km away — roughly 6–8 minutes by car.</p>
                <a
                  className="nearby-link"
                  href={directionsFromProperty("-24.732604,30.2058304")}
                  rel="noreferrer"
                  target="_blank"
                >
                  Directions from the property <Icon name="arrow" />
                </a>
              </article>

              <article className="nearby-card">
                <span className="nearby-category">LOCAL SHOPPING</span>
                <h4>Steelpoort Town</h4>
                <p>Local shopping, food stops and everyday services nearby.</p>
                <a
                  className="nearby-link"
                  href={directionsFromProperty(
                    "Steelpoort Town, Limpopo, South Africa",
                  )}
                  rel="noreferrer"
                  target="_blank"
                >
                  Directions from the property <Icon name="arrow" />
                </a>
              </article>

              <article className="nearby-card">
                <span className="nearby-category">
                  BURGERSFORT · SHOPPING &amp; ENTERTAINMENT
                </span>
                <h4>Tubatse Crossing</h4>
                <p>
                  Burgersfort is about 22 km away, roughly 23 minutes by road.
                  The centre has 90+ stores, restaurants and entertainment.
                </p>
                <div className="nearby-actions">
                  <a
                    className="nearby-link"
                    href={directionsFromProperty(
                      "Tubatse Crossing Shopping Centre, Burgersfort, Limpopo, South Africa",
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get directions <Icon name="arrow" />
                  </a>
                  <a
                    className="nearby-link"
                    href="https://tubatsecrossingshopping.co.za/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Centre information <Icon name="arrow" />
                  </a>
                </div>
              </article>

              <article className="nearby-card">
                <span className="nearby-category">GOLF &amp; OUTDOORS</span>
                <h4>Tubatse Chrome Club</h4>
                <p>
                  An 18-hole woodland golf course with a clubhouse, restaurant,
                  pool and other sports facilities. Check visitor access before
                  you go.
                </p>
                <div className="nearby-actions">
                  <a
                    className="nearby-link"
                    href={directionsFromProperty(
                      "Tubatse Chrome Club, Steelpoort, Limpopo, South Africa",
                    )}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get directions <Icon name="arrow" />
                  </a>
                  <a
                    className="nearby-link"
                    href="https://www.hole19golf.com/courses/tubatse-chrome-club"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Course information <Icon name="arrow" />
                  </a>
                </div>
              </article>

              <article className="nearby-card">
                <span className="nearby-category">
                  CASINO &amp; ENTERTAINMENT
                </span>
                <h4>Thaba Moshate</h4>
                <p>
                  A casino resort in Burgersfort with restaurants, a spa and
                  entertainment. About 18 km, or 20–25 minutes by road.
                </p>
                <div className="nearby-actions">
                  <a
                    className="nearby-link"
                    href={directionsFromProperty("-24.6669325,30.3029736")}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Get directions <Icon name="arrow" />
                  </a>
                  <a
                    className="nearby-link"
                    href="https://www.peermont.com/properties/thaba-moshate/"
                    rel="noreferrer"
                    target="_blank"
                  >
                    Resort information <Icon name="arrow" />
                  </a>
                </div>
              </article>

              <article className="nearby-card nearby-mines-card">
                <span className="nearby-category">WORK &amp; INDUSTRY</span>
                <h4>Nearby mining operations</h4>
                <p>
                  Explore the Steelpoort-area chrome and platinum mining
                  corridor.
                </p>
                <div className="nearby-mine-links">
                  {nearbyMines.map((mine) => (
                    <a
                      href={mine.href}
                      key={mine.name}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {mine.name} <Icon name="arrow" />
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </section>
        </section>
        </CinematicExperience>
        <ScrollTour />
      </main>

      <footer className="site-footer">
        <div className="page-shell footer-inner">
          <a aria-label="J & J Grootboom Farm Accommodation home" className="brand footer-brand" href="#home">
            <Image
              alt=""
              aria-hidden="true"
              className="brand-logo"
              height={69}
              src="/images/j-and-j-grootboom-farm-logo.svg"
              width={64}
            />
            <Image
              alt=""
              aria-hidden="true"
              className="brand-logo"
              height={28}
              src="/images/j-and-j-grootboom-farm-wordmark.svg"
              style={{ width: "clamp(130px, 36vw, 200px)" }}
              width={200}
            />
          </a>
          <p>Come as you are. Stay awhile.</p>
          <a className="back-to-top" href="#home">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
        <div className="footer-bottom page-shell">
          <span>© 2026 J &amp; J Grootboom Farm Accommodation</span>
          <span>336KT Grootboom Farm · Steelpoort, Limpopo</span>
        </div>
      </footer>

      <a className="mobile-booking" href={bookingUrl} rel="noreferrer" target="_blank">
        Enquire on WhatsApp <Icon name="arrow" />
      </a>
    </>
  );
}
