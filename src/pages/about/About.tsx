import React from 'react';
import { 
  Profile2User, 
  Award, 
  ShieldTick, 
  ArrowRight,
} from 'iconsax-react';
import Layout from '../../layout/Layout';

interface ValueItem {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StatItem {
  id: number;
  value: string;
  label: string;
}

const AboutPage: React.FC = () => {
  const stats: StatItem[] = [
    { id: 1, value: '#1', label: 'In UK Sustainability' },
    { id: 2, value: '100%', label: 'DBS Checked Staff' },
    { id: 3, value: 'TR-19', label: 'Certified Cleaning' },
    { id: 4, value: '24/7', label: 'Commercial Support' },
  ];

  const values: ValueItem[] = [
    {
      id: 1,
      title: 'Trusted & Secure',
      description: 'Security and peace of mind are paramount. Every single one of our cleaners is fully DBS checked, approved, and rigorously vetted.',
      icon: <ShieldTick size="28" variant="Linear"  color="currentColor"/>,
    },
    {
      id: 2,
      title: 'Certified Expertise',
      description: 'From private residential spaces to specialized TR-19 kitchen deep cleans for schools and event centres, we operate to the highest industry standards.',
      icon: <Award size="28" variant="Linear" color="currentColor" />,
    },
    {
      id: 3,
      title: 'Inclusive Culture',
      description: 'We are proudly an inclusive place to work. We recruit, train, and empower diverse individuals who take absolute pride in hygiene and hospitality.',
      icon: <Profile2User size="28" variant="Linear"  color="currentColor"/>,
    },
  ];

  return (
    <Layout>
      <main className="w-full bg-[#FAFAFA] font-sans text-gray-900 border-t border-gray-200">
        
        {/* ── SECTION 1: EDITORIAL HERO ── */}
        <section className="py-24 px-6 md:px-12 lg:px-20 border-b border-gray-200">
          <article className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            <header className="flex flex-col gap-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">
                Who We Are
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Sustainable <br /> excellence for <br /> every space.
              </h1>
            </header>

            <section className="flex flex-col gap-6">
              <p className="text-gray-500 text-lg md:text-xl leading-relaxed">
                Recognized as the No. 1 sustainable cleaning company in the UK, GlittersCleaning provides uncompromising residential and commercial cleaning solutions that prioritize both hygiene and the environment.
              </p>
              <p className="text-gray-500 text-base leading-relaxed">
                We do not cut corners. Whether we are managing private homes, HMOs, care homes, or vast event centres, we build structured systems around property care. Backed by specialized TR-19 certifications, we ensure your space truly shines.
              </p>
            </section>

          </article>
        </section>

        {/* ── SECTION 2: WIREFRAME IMPACT STATS ── */}
        <section className="w-full border-b border-gray-200 bg-gray-200" aria-label="Agency milestones">
          <ul className="max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px">
            {stats.map((stat) => (
              <li key={stat.id} className="bg-white py-12 px-6 text-center flex flex-col gap-2">
                <span className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── SECTION 3: THE NARRATIVE / ASYMMETRIC IMAGE ── */}
        <section className="py-24 px-6 md:px-12 lg:px-20 border-b border-gray-200 bg-white">
          <article className="max-w-[1400px] mx-auto flex flex-col-reverse lg:flex-row items-center gap-16 lg:gap-24">
            
            {/* Images with Flat Border Cutout Effect */}
            <figure className="relative w-full lg:w-1/2 h-[450px] md:h-[550px]" aria-hidden="true">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1470&auto=format&fit=crop"
                alt="Impeccable high-end modern interior kitchen"
                className="absolute top-0 left-0 w-[80%] h-[85%] object-cover grayscale-[30%] hover:grayscale-0 transition-all duration-500"
              />
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1470&auto=format&fit=crop"
                alt="Detailed wiping process illustration"
                className="absolute bottom-0 right-0 w-[50%] h-[55%] object-cover border-[12px] border-white"
              />
            </figure>

            {/* Narrative Text */}
            <section className="w-full lg:w-1/2 flex flex-col gap-8">
              <header>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-4">
                  Our Narrative
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
                  Commercial & residential cleaning, tailored for you.
                </h2>
              </header>
              
              <p className="text-gray-500 text-base leading-relaxed">
                Every facility has independent challenges. Whether servicing schools, care homes, event centres, or private properties, our approach remains the same: elite sanitization driven by eco-conscious, sustainable methods. 
              </p>

              <blockquote className="border-l-2 border-green-600 pl-6 my-2 italic text-gray-700 font-medium text-base">
                "Sustainability isn't just about the products we use; it's about building a safe, inclusive, and spotless environment for our clients and our team."
              </blockquote>
            </section>

          </article>
        </section>

        {/* ── SECTION 4: CORE VALUES GRID ── */}
        <section className="py-24 px-6 md:px-12 lg:px-20 border-b border-gray-200 bg-[#FAFAFA]" aria-label="Our Core Values">
          <article className="max-w-[1400px] mx-auto flex flex-col gap-16">
            
            <header className="max-w-2xl">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600 mb-4">
                Our Principles
              </p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                The convictions driving our execution.
              </h2>
            </header>

            <nav aria-label="Values checklist">
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
                {values.map((value) => (
                  <li key={value.id} className="bg-white p-10 md:p-12 flex flex-col gap-6 group hover:bg-gray-900 transition-colors duration-300">
                    <figure className="text-gray-900 group-hover:text-green-400 transition-colors duration-300">
                      {value.icon}
                    </figure>
                    <section className="flex flex-col gap-3">
                      <h3 className="text-gray-900 group-hover:text-white font-bold text-xl transition-colors duration-300">
                        {value.title}
                      </h3>
                      <p className="text-gray-500 group-hover:text-gray-400 text-sm md:text-base leading-relaxed transition-colors duration-300">
                        {value.description}
                      </p>
                    </section>
                  </li>
                ))}
              </ul>
            </nav>

          </article>
        </section>

        {/* ── SECTION 5: TEAM / INTELLECTUAL LEADERSHIP ── */}
        <section className="py-24 px-6 md:px-12 lg:px-20 bg-white">
          <article className="max-w-[1400px] mx-auto flex flex-col gap-16">

            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <section className="flex flex-col gap-4">
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
                  Our Team
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  Vetted, approved, and ready.
                </h2>
              </section>
              <p className="text-gray-500 text-base max-w-sm md:text-right">
                Our workforce consists entirely of fully DBS-checked cleaners, managed by experts in commercial, residential, and specialized facility sanitization.
              </p>
            </header>

            {/* Bottom Action Block */}
            <aside className="border-t border-gray-200 pt-12 mt-4 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-gray-500 text-base">
                Ready to experience the UK's #1 sustainable cleaning service in your home or business?
              </p>
              <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gray-900 hover:bg-green-600 text-white font-medium py-4 px-8 transition-colors duration-200">
                Book a Free Trial
                <ArrowRight size="18" variant="Linear" color="currentColor" />
              </button>
            </aside>

          </article>
        </section>

      </main>
    </Layout>
  );
};

export default AboutPage;