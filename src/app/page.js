import HeroSection from "@/components/home/HeroSection";
import BestSellers from "@/components/home/BestSellers";
import Banner from "@/components/home/Banner";
import Testimonials from "@/components/home/Testimonials";
import PopularPicks from "@/components/home/PopularPicks";
import AboutSection from "@/components/home/AboutSection";
import VideoReels from "@/components/home/VideoReels";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import CommunityGallery from "@/components/home/CommunityGallery";
import BulkOrders from "@/components/home/BulkOrders";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <BestSellers />
      <Banner />
      <PopularPicks />
      <WhyChooseUs />
      <AboutSection />
      <VideoReels />
      <Testimonials />
      <BulkOrders />
      <CommunityGallery />
    </>
  );
}
