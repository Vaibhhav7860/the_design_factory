import { Cinzel, Montserrat, Great_Vibes } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata = {
  title: "The Design Factory | Premium Personalized Gifts & Stationery",
  description:
    "The Design Factory provides complete solutions to adorn your lives in a unique way. Discover personalized labels, gift stationery, school essentials, bags, and more — handcrafted with love.",
  keywords: "personalized gifts, custom labels, school essentials, gift stationery, personalized stationery, kids gifts, iron on labels, bag tags",
  openGraph: {
    title: "The Design Factory | Handcrafted with Love",
    description: "Premium personalized gifts & stationery for every occasion",
    type: "website",
    url: "https://thedesignfactoryshop.com",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${montserrat.variable} ${greatVibes.variable}`}
    >
      <body className={montserrat.className}>
        <CartProvider>
          <Navbar />
          <main style={{ paddingTop: "var(--nav-height)" }}>{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
