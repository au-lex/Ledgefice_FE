
import PricingSection from "./Pricing";
import FeaturesSection from "./Features";
import Footer from "./Footer";
import HowItWorksSection from "./Howitwork";
import CTABanner from "./Cta";
import Header from "./Header";
import HeroSection from "./Hero";
import FAQSection from "./Faq";
import TestimonialsSection from "./Testimonia";
import ContactSection from "./Contact";



export default function LandingPage() {
    return (
        <>
            <Header />

            <div className="min-h-screen w-full bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-zinc-100">

                <HeroSection />


                {/* Trust strip */}
                <HowItWorksSection />
                <FeaturesSection />
                <PricingSection />
                <TestimonialsSection />
                <FAQSection />

                <CTABanner />
                <ContactSection />

                <Footer />

            </div>
        </>
    );
}