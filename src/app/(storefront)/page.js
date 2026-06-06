import { cookies } from "next/headers";
import PasswordPopup from "@/components/PasswordPopup";
import HeroSection from "@/components/home/HeroSection";
import BestSellers from "@/components/home/BestSellers";
import Banner from "@/components/home/Banner";
import Testimonials from "@/components/home/Testimonials";
import PopularPicks from "@/components/home/PopularPicks";
import AboutSection from "@/components/home/AboutSection";
import ComboBanner from "@/components/ComboBanner";
import VideoReels from "@/components/home/VideoReels";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CommunityGallery from "@/components/home/CommunityGallery";
import BulkOrders from "@/components/home/BulkOrders";
import { connectToDatabase } from "@/lib/db/mongoose";
import { ContentBlock } from "@/lib/db/models/ContentBlock";

// Render on demand. The homepage's BestSellers section reads from
// MongoDB, and DB credentials aren't available at build time on Vercel.
export const dynamic = "force-dynamic";

async function getCarouselConfig() {
  try {
    await connectToDatabase();
    const block = await ContentBlock.findOne({ key: "hero-carousel" }).lean();
    if (block?.data?.slides?.length) {
      return { mediaType: block.data.mediaType || "video", slides: block.data.slides };
    }
  } catch {}
  return null;
}

export default async function HomePage() {
  const storePassword = process.env.STOREFRONT_PASSWORD;
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("storefront_unlocked")?.value === "true";

  if (storePassword && !unlocked) {
    return <PasswordPopup />;
  }

  const carousel = await getCarouselConfig();

  return (
    <>
      <HeroSection slides={carousel?.slides} mediaType={carousel?.mediaType} />
      <BestSellers />
      <Banner />
      <PopularPicks />
      <WhyChooseUs />
      <AboutSection />
      <ComboBanner />
      <VideoReels />
      <Testimonials />
      <BulkOrders />
      <CommunityGallery />
    </>
  );
}
