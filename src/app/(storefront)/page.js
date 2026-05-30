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

// Render on demand. The homepage's BestSellers section reads from
// MongoDB, and DB credentials aren't available at build time on Vercel.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <HeroSection />
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
