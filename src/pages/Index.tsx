import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrustTicker from "@/components/TrustTicker";
import ThreePaths from "@/components/ThreePaths";
import HowItWorks from "@/components/HowItWorks";
import FeaturedListings from "@/components/FeaturedListings";
import KeyBenefits from "@/components/KeyBenefits";
import NewspaperLatestUpdates from "@/components/NewspaperLatestUpdates";
import Footer from "@/components/Footer";
import { CashbackGift } from "@/components/CashbackGift";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={introComplete ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-50"
      >
        <Navbar forceScrolled />
      </motion.div>

      <HeroSection onIntroComplete={() => setIntroComplete(true)} introComplete={introComplete} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={introComplete ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TrustTicker />
        <ThreePaths />
        <HowItWorks />
        <FeaturedListings />
        <KeyBenefits />
        <NewspaperLatestUpdates />
        <Footer />
        <CashbackGift />
      </motion.div>
    </div>
  );
};

export default Index;
