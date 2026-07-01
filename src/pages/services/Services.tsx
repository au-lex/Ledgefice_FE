import React from 'react';
import { 
  TickCircle, 
  ArrowRight, 
  MagicStar,
  Setting4
} from 'iconsax-react';
import Layout from '../../layout/Layout';

interface ServiceDetail {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  includes: string[];
  image: string;
}

const ServicesPage: React.FC = () => {
  const services: ServiceDetail[] = [
    {
      id: 1,
      title: 'Private Residential & HMOs',
      subtitle: 'Uncompromising Home & Estate Care',
      description: 'We approach private residences and Houses in Multiple Occupation (HMOs) with the utmost discretion and meticulous attention to detail. Our fully DBS-checked team ensures every room and communal area is sustainably cleaned without disrupting your sanctuary.',
      includes: [
        'Complete surface sanitization & polishing',
        'HMO communal area maintenance',
        'Eco-friendly deep carpet extraction',
        'High-value asset dusting & care'
      ],
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=2075&auto=format&fit=crop',
    },
    {
      id: 2,
      title: 'Commercial, Schools & Care',
      subtitle: 'Unobtrusive Facility Maintenance',
      description: 'A pristine environment is vital for focus, health, and morale. We engineer specific protocols for sensitive environments including care homes, schools, and large event centres, using 100% sustainable methods to protect your staff, students, and guests.',
      includes: [
        'Care home hygiene & sanitization protocols',
        'School & educational facility daily cleaning',
        'Event centre pre & post-event resets',
        'Waste management & recycling optimization'
      ],
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop',
    },
    {
      id: 3,
      title: 'TR-19 Kitchen Deep Cleaning',
      subtitle: 'Certified Commercial Extraction Care',
      description: 'Specialized, fully certified TR-19 kitchen deep cleaning designed for commercial kitchens, schools, and event centres. Our rigorous process ensures fire safety compliance, eliminating grease buildup and resetting your kitchen to absolute hygiene standards.',
      includes: [
        'TR-19 certified extraction & duct cleaning',
        'Commercial appliance degreasing & restoration',
        'Ventilation and canopy deep cleans',
        'Fire hazard reduction & compliance reporting'
      ],
      image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop',
    }
  ];

  return (
    <Layout>
      <main className="w-full bg-[#FAFAFA] font-sans text-gray-900 border-t border-gray-200">
        
        {/* ── PAGE HEADER ── */}
        <section className="pt-32 pb-24 px-6 md:px-12 lg:px-20 border-b border-gray-200 bg-white">
          <header className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-10">
            <section className="flex flex-col gap-6">
              <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">
                Our Capabilities
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                Specialized <br className="hidden lg:block" /> hygiene solutions.
              </h1>
            </section>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-md md:text-right">
              Explore our specialized service divisions. As the UK's No. 1 sustainable cleaning company, every protocol is executed by our inclusive, fully DBS-checked team.
            </p>
          </header>
        </section>

        {/* ── SERVICES EDITORIAL LIST ── */}
        <section className="w-full">
          <article className="flex flex-col">
            {services.map((service, index) => {
              // Alternate layout: Even indexes have image on left, odd have image on right
              const isEven = index % 2 === 0;

              return (
                <section 
                  key={service.id} 
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} border-b border-gray-200 bg-white`}
                >
                  
                  {/* Image Block */}
                  <figure className="w-full lg:w-1/2 h-[400px] lg:h-[700px] relative overflow-hidden bg-gray-100 border-b lg:border-b-0 lg:border-r border-gray-200">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="absolute inset-0 w-full h-full object-cover grayscale-[25%] hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 hover:scale-100"
                    />
                    {/* Floating index number for editorial feel */}
                    <figcaption className="absolute top-6 left-6 lg:top-10 lg:left-10 bg-white text-gray-900 text-xs font-bold font-mono px-4 py-2 uppercase tracking-widest border border-gray-200">
                      Srv / 0{service.id}
                    </figcaption>
                  </figure>

                  {/* Content Block */}
                  <section className="w-full lg:w-1/2 p-8 md:p-16 lg:p-24 flex flex-col justify-center">
                    <header className="flex flex-col gap-4 mb-8">
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                        {service.title}
                      </h2>
                      <p className="text-green-600 text-sm font-bold uppercase tracking-[0.15em]">
                        {service.subtitle}
                      </p>
                    </header>

                    <p className="text-gray-500 text-base md:text-lg leading-relaxed mb-10">
                      {service.description}
                    </p>

                    {/* Checklist */}
                    <section className="flex flex-col gap-5 mb-12">
                      <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 border-b border-gray-200 pb-4">
                        Protocol Inclusions
                      </h3>
                      <ul className="flex flex-col gap-4">
                        {service.includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-4">
                            <TickCircle size="20" color="currentColor" className="text-green-600 shrink-0 mt-0.5" variant="Linear" />
                            <span className="text-gray-600 font-medium">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    {/* Service CTA */}
                    <nav aria-label={`Action for ${service.title}`}>
                      <a 
                        href="/contact" 
                        className="inline-flex items-center gap-3 text-gray-900 hover:text-green-600 text-sm font-bold uppercase tracking-[0.1em] transition-colors duration-300 border-b border-gray-900 hover:border-green-600 pb-1 w-max"
                      >
                        Request this service
                        <ArrowRight size="16" variant="Linear" color="currentColor" />
                      </a>
                    </nav>

                  </section>
                </section>
              );
            })}
          </article>
        </section>

        {/* ── CUSTOM SOLUTIONS & GUARANTEE CTA ── */}
        <section className="bg-gray-900 text-white py-24 px-6 md:px-12 lg:px-20 border-b border-gray-800">
          <article className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <section className="flex flex-col gap-8">
              <header className="flex items-center gap-4 mb-2">
                <MagicStar size="32" color="currentColor" className="text-green-500" variant="Linear" />
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Require a custom protocol?
                </h2>
              </header>
              <p className="text-gray-400 text-lg leading-relaxed max-w-md">
                We understand that care facilities, schools, and specialized commercial kitchens require tailored operating procedures. Our inclusive, trained team is ready to adapt.
              </p>
              <nav className="mt-4" aria-label="Custom solutions contact">
                <a href="/contact" className="flex items-center justify-center gap-3 bg-white text-gray-900 hover:bg-green-500 hover:text-white transition-colors duration-300 py-4 px-8 font-bold uppercase tracking-[0.1em] text-sm w-max">
                  <Setting4 size="18" variant="Linear" color="currentColor" />
                  Configure Custom Plan
                </a>
              </nav>
            </section>

            <aside className="border-t lg:border-t-0 lg:border-l border-gray-800 pt-12 lg:pt-0 lg:pl-16 flex flex-col gap-6">
              <h3 className="text-xl font-bold">The GlittersCleaning Guarantee</h3>
              <p className="text-gray-400 leading-relaxed">
                As the UK's leading sustainable cleaning company, excellence is our baseline. If our execution falls short of leaving your space spotless and glittering, we return within 24 hours to rectify the oversight at zero additional cost.
              </p>
            </aside>

          </article>
        </section>

      </main>
    </Layout>
  );
};

export default ServicesPage;