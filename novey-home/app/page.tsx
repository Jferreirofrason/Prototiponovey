import Navbar from '../components/Navbar';
import PromoBar from '../components/PromoBar';
import HeroBanner from '../components/HeroBanner';
import QuickCategories from '../components/QuickCategories';
import FeaturedProducts from '../components/FeaturedProducts';
import FastDelivery from '../components/FastDelivery';
import Departments from '../components/Departments';
import FlashOffers from '../components/FlashOffers';
import FeaturedVideos from '../components/FeaturedVideos';
import NewsBrands from '../components/NewsBrands';
import PromiseSection from '../components/PromiseSection';
import ExclusiveBrands from '../components/ExclusiveBrands';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <PromoBar />
      <main className="flex flex-col gap-6 pt-8 pb-[42px]">
        <HeroBanner />
        <QuickCategories />
        <FeaturedProducts />
        <FastDelivery />
        <Departments />
        <FlashOffers />
        <FeaturedVideos />
        <NewsBrands />
        <ExclusiveBrands />
        <PromiseSection />
      </main>
      <Footer />
    </>
  );
}
