import { Cormorant_Garamond, Montserrat, Birthstone_Bounce, Satisfy } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const birthstone = Birthstone_Bounce({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-birthstone",
  display: "swap",
});

const satisfy = Satisfy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-satisfy-var",
  display: "swap",
});

export const metadata = {
  title: "The Design Factory | Premium Personalized Gifts & Stationery",
  description:
    "The Design Factory provides complete solutions to adorn your lives in a unique way. Discover personalized labels, gift stationery, school essentials, bags, and more — handcrafted with love.",
  keywords:
    "personalized gifts, custom labels, school essentials, gift stationery, personalized stationery, kids gifts, iron on labels, bag tags, name labels, school bags, gift tags",
  openGraph: {
    title: "The Design Factory | Handcrafted with Love",
    description:
      "Premium personalized gifts & stationery for every occasion. Labels, bags, school essentials, and more.",
    type: "website",
    url: "https://thedesignfactoryshop.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Design Factory | Premium Personalized Gifts & Stationery",
    description:
      "Handcrafted personalized gifts, labels, bags, and stationery.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#FAF9F6",
};

/**
 * Root layout: HTML shell, fonts, metadata only.
 *
 * Storefront chrome (Navbar / Footer / CartProvider) lives inside
 * `(storefront)/layout.js` so it doesn't leak into the admin or any
 * future route group. The admin's own chrome lives in `admin/layout.js`.
 */
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} ${birthstone.variable} ${satisfy.variable}`}
    >
      <head>
        {/* iOS Specific Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="The Design Factory" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* iOS Safe Area */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}
