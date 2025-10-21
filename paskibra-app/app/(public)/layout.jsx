import Image from "next/image";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ScrollToTopButton from "@/components/public/ScrollToTopButton";

export default function Home({ children }) {
  return (
    <>
      <Header />
      {children}
      <ScrollToTopButton />
      <Footer />
    </>
  );
}
