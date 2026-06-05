import React from 'react';
import { Hero } from '../components/Hero';
import { Products } from '../components/Products';
import { NaturalHairCare } from '../components/NaturalHairCare';
import { AntiAcneSection } from '../components/AntiAcneSection';
import { SummerSunProtection } from '../components/SummerSunProtection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { AboutUs } from '../components/AboutUs';
import { Banner } from '../components/Banner';
import { Features } from '../components/Features';
import { Blog } from '../components/Blog';
import { Agents } from '../components/Agents';
import { ContactUs } from '../components/ContactUs';
export function Home() {
  return (
    <main>
      <Hero />
      <Products />
      <NaturalHairCare />
      <AntiAcneSection />
      <SummerSunProtection />
      <WhyChooseUs />
      <AboutUs />
      <Banner />
      <Features />
      <Blog />
      <Agents />
      <ContactUs />
    </main>);

}