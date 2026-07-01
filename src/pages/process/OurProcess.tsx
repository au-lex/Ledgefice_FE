import React from 'react';
import { 
  Setting2, 
  MagicStar, 
  ShieldTick, 
  ArrowRight,
  TickCircle,
  SearchZoomOut
} from 'iconsax-react';
import Layout from '../../layout/Layout';

interface ProcessStep {
  id: number;
  number: string;
  title: string;
  description: string;
  actions: string[];
  icon: React.ReactNode;
}

const ProcessPage: React.FC = () => {
  const steps: ProcessStep[] = [
    {
      id: 1,
      number: '01',
      title: 'Discovery & Assessment',
      description: 'We do not believe in one-size-fits-all solutions. Our relationship begins with a comprehensive audit of your environment—from care homes and event centres to private HMOs—to understand its unique hygiene, footfall, and compliance requirements.',
      actions: [
        'On-site environmental & safety assessment',
        'Material and surface vulnerability check',
        'Custom residential or commercial schedule formulation'
      ],
      icon: <SearchZoomOut size="32" variant="Linear"  color="currentColor"/>,
    },
    {
      id: 2,
      number: '02',
      title: 'Strategic Deployment',
      description: 'Based on the blueprint, we assemble a dedicated, fully DBS-checked team. As a proudly inclusive workplace, we deploy highly trained professionals equipped exclusively with top-tier, eco-friendly, and sustainable cleaning agents.',
      actions: [
        'Vetted, DBS-approved specialist assignment',
        '100% sustainable & eco-solvent selection',
        'Security and access protocol briefing'
      ],
      icon: <Setting2 size="32" variant="Linear"  color="currentColor"/>,
    },
    {
      id: 3,
      number: '03',
      title: 'Meticulous Execution',
      description: 'Our experts execute the blueprint with absolute precision. Operating efficiently and safely, we utilize advanced green technology to reset your space to an immaculate baseline—including rigorous TR-19 deep cleaning for commercial kitchens.',
      actions: [
        'Multi-stage sustainable surface purification',
        'Air-quality and ventilation dusting',
        'TR-19 compliant extraction deep cleaning (if applicable)'
      ],
      icon: <MagicStar size="32" variant="Linear" color="currentColor" />,
    },
    {
      id: 4,
      number: '04',
      title: 'Quality Assurance',
      description: 'Execution is meaningless without verification. A designated supervisor conducts a rigorous post-service walkthrough using our proprietary checklist to ensure our uncompromising standards of cleanliness and sustainability have been met.',
      actions: [
        'Micro-inspection of critical zones',
        'Client walkthrough and feedback collection',
        'Immediate on-site rectifications if necessary'
      ],
      icon: <ShieldTick size="32" variant="Linear" color="currentColor" />,
    },
  ];

  return (
    <Layout>
      <main className="w-full bg-[#FAFAFA] font-sans text-gray-900 border-t border-gray-200">
        
        {/* ── HERO SECTION ── */}
        <section className="pt-32 pb-24 px-6 md:px-12 lg:px-20 border-b border-gray-200 bg-white">
          <header className="max-w-[1400px] mx-auto flex flex-col gap-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">
              Our Sustainable Methodology
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-4xl">
              A systematic approach to sustainable excellence.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mt-4">
              We remove the unpredictability from property care. As the UK's No.1 sustainable cleaning company, our four-step operational protocol is engineered to guarantee safety, eco-conscious results, and absolute perfection on every visit.
            </p>
          </header>
        </section>

        {/* ── STICKY SCROLL PROCESS SECTION ── */}
        <section className="w-full border-b border-gray-200">
          <article className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-start">
            
            {/* Left Column: Sticky Header */}
            <header className="w-full lg:w-1/3 lg:sticky lg:top-32 p-6 md:p-12 lg:p-20 lg:border-r border-gray-200">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">
                The 4-Step Protocol
              </h2>
              <p className="text-gray-500 text-base leading-relaxed mb-10">
                Whether managing a private HMO, maintaining a bustling school, or executing a certified kitchen deep clean, our methodology remains uncompromising. Discover the framework driven by our inclusive, elite professionals.
              </p>
              
              <figure className="w-full aspect-[4/3] overflow-hidden bg-gray-100" aria-hidden="true">
                <img
                  src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop"
                  alt="Detail shot of sustainable cleaning equipment"
                  className="w-full h-full object-cover grayscale-[20%]"
                />
              </figure>
            </header>

            {/* Right Column: Process Steps List */}
            <nav className="w-full lg:w-2/3" aria-label="Process Steps">
              <ul className="flex flex-col">
                {steps.map((step, index) => (
                  <li 
                    key={step.id} 
                    className={`p-6 md:p-12 lg:p-20 bg-white group hover:bg-gray-900 transition-colors duration-500 ${
                      index !== steps.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    <header className="flex items-start justify-between mb-10">
                      <figure className="text-gray-900 group-hover:text-green-400 transition-colors duration-500">
                        {step.icon}
                      </figure>
                      <span className="text-gray-200 group-hover:text-gray-800 font-mono text-5xl md:text-6xl font-extrabold transition-colors duration-500 leading-none">
                        {step.number}
                      </span>
                    </header>

                    <section className="flex flex-col gap-6">
                      <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 group-hover:text-white transition-colors duration-500 tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-gray-500 group-hover:text-gray-400 text-base md:text-lg leading-relaxed transition-colors duration-500 max-w-2xl">
                        {step.description}
                      </p>
                    </section>

                    {/* Actions / Sub-list */}
                    <section className="mt-10 pt-10 border-t border-gray-100 group-hover:border-gray-800 transition-colors duration-500">
                      <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 group-hover:text-gray-500 mb-6 transition-colors duration-500">
                        Key Objectives
                      </h4>
                      <ul className="flex flex-col gap-4">
                        {step.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <TickCircle size="20" color="currentColor" className="text-green-600 shrink-0 mt-0.5" variant="Linear" />
                            <span className="text-gray-600 group-hover:text-gray-300 font-medium transition-colors duration-500">
                              {action}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </li>
                ))}
              </ul>
            </nav>

          </article>
        </section>

        {/* ── BOTTOM CTA SECTION ── */}
        <section className="bg-gray-900 py-24 px-6 md:px-12 lg:px-20 text-white">
          <article className="max-w-[1000px] mx-auto text-center flex flex-col items-center gap-10">
            <header className="flex flex-col items-center gap-6">
              <p className="text-green-500 text-xs font-bold tracking-[0.2em] uppercase">
                Ready to elevate your space?
              </p>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                Experience the UK's #1 sustainable clean today.
              </h2>
            </header>
            
            <nav aria-label="Call to Action">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-green-500 hover:text-white transition-colors duration-300 py-5 px-10 font-bold uppercase tracking-[0.1em] text-sm"
              >
                Book a Free Clean Trial
                <ArrowRight size="18" variant="Linear" />
              </a>
            </nav>
          </article>
        </section>

      </main>
    </Layout>
  );
};

export default ProcessPage;