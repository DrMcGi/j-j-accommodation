import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "J & J Grootboom Farm Accommodation | Steelpoort",
    template: "%s | J & J Grootboom Farm Accommodation",
  },
  description:
    "Overnight and monthly furnished accommodation at Grootboom Farm in Steelpoort, Limpopo. Daily cleaning, free Wi-Fi, 24/7 security, electricity included, and solar backup.",
  applicationName: "J & J Grootboom Farm Accommodation",
  openGraph: {
    title: "J & J Grootboom Farm Accommodation",
    description:
      "A peaceful farm stay in Steelpoort with furnished accommodation, daily cleaning, free Wi-Fi, and solar backup.",
    type: "website",
    locale: "en_ZA",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
