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
import { StoreLocator } from '../components/StoreLocator';
import { BrandsStrip, ShopByCategory, ShopPromo } from '../components/shop/HomeCatalog';
export function Home() {
  return (
    <main>
      <Hero />
      <ShopByCategory />
      <Products />
      <ShopPromo />
      <NaturalHairCare />
      <AntiAcneSection />
      <SummerSunProtection />
      <BrandsStrip />
      <WhyChooseUs />
      <AboutUs />
      <Banner />
      <Features />
      <Blog />
      <Agents />
      <StoreLocator />
      <ContactUs />
    </main>);

}
