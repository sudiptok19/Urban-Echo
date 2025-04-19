import React from 'react'
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
// import FeaturesSection from '../components/FeaturesSection';
import Footer from '../components/Footer';



export default function Home() {
  return (
    <div className="bg-gray-50">
      <Navbar />
      <main className="container mx-auto mt-10 px-4">
        <HeroSection />
        {/* <FeaturesSection /> */}
      </main>
      <Footer />
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .fade-in {
          animation: fade-in 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};
