import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import BestSellers from "@/components/home/BestSellers";
import Testimonials from "@/components/home/Testimonials";
import BlogPreview from "@/components/home/BlogPreview";
import FAQ from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryShowcase />
      <BestSellers />
      <Testimonials />
      <BlogPreview />
      <FAQ />
    </>
  );
}
