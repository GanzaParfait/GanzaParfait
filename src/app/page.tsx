import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WorkHistory from "@/components/WorkHistory";
import Credentials from "@/components/Credentials";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <Hero />
        <WorkHistory />
        <Credentials />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
