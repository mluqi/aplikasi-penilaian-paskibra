import Image from "next/image";
import Header from "@/components/public/Header";
import Hero from "@/components/public/Hero";
import Mitra from "@/components/public/Mitra";
import Features from "@/components/public/Features";
import TargetAudience from "@/components/public/TargetAudience";
import Testimonials from "@/components/public/Testimonials";
import FAQ from "@/components/public/FAQ";
import HowItWorks from "@/components/public/HowItWorks";
import Footer from "@/components/public/Footer";
import ScrollToTopButton from "@/components/public/ScrollToTopButton";
import Pricing from "@/components/public/Pricing";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Mitra />
      <Features />
      <TargetAudience />
      <Testimonials />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <ScrollToTopButton />
      <Footer />
    </>
  );
}
