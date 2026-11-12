import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "J & J Grootboom Farm Accommodation | Steelpoort",
    template: "%s | J & J Grootboom Farm Accommodation",
  },
  description:
    "Overnight and monthly furnished accommodation at Grootboom Farm in Steelpoort, Limpopo. Daily cleaning, free Wi-Fi, and 24/7 security.",
  applicationName: "J & J Grootboom Farm Accommodation",
  openGraph: {
    title: "J & J Grootboom Farm Accommodation",
    description:
      "A warm, furnished place to settle in at Grootboom Farm, Steelpoort.",
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
