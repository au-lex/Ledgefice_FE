import React, { useState } from 'react';
import { 
  Call, 
  Location, 
  Clock,
  Send2,
  ArrowDown2
} from 'iconsax-react';
import Layout from '../../layout/Layout';

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    facilityType: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Inquiry submitted:', form);
  };

  return (
    <Layout>
      <main className="w-full bg-[#FAFAFA] font-sans text-gray-900 border-t border-gray-200">
        
        {/* ── PAGE HEADER ── */}
        <section className="pt-32 pb-16 px-6 md:px-12 lg:px-20 border-b border-gray-200 bg-white">
          <header className="max-w-[1400px] mx-auto flex flex-col gap-6">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-green-600">
              Initiate a Dialogue
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Let’s discuss <br /> your space.
            </h1>
            <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mt-2">
              Whether you manage a private HMO, a sensitive care home, an active school, or require TR-19 certified kitchen deep cleaning, our inclusive, DBS-checked team is ready to deliver the UK's best sustainable clean.
            </p>
          </header>
        </section>

        {/* ── ASYMMETRIC CONTACT GRID ── */}
        <section className="w-full">
          <article className="max-w-[1400px] mx-auto flex flex-col lg:flex-row">
            
            {/* LEFT: Corporate Information */}
            <address className="w-full lg:w-5/12 bg-gray-900 text-white p-6 md:p-12 lg:p-20 not-italic flex flex-col gap-16 border-r border-gray-800">
              
              {/* Headquarters Image */}
              <figure className="w-full aspect-[4/3] overflow-hidden bg-black" aria-hidden="true">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                  alt="GlittersCleaning Operations"
                  className="w-full h-full object-cover grayscale-[40%] hover:grayscale-0 transition-all duration-700 ease-in-out scale-105 hover:scale-100 opacity-80"
                />
              </figure>

              <ul className="flex flex-col gap-12">
                {/* Location */}
                <li className="flex items-start gap-5 group">
                  <figure className="text-gray-500 group-hover:text-green-500 transition-colors duration-300 mt-1">
                    <Location size="28" variant="Linear" />
                  </figure>
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                      UK Operations
                    </h3>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      Serving clients nationwide <br /> 
                      Across the United Kingdom
                    </p>
                  </section>
                </li>

                {/* Direct Lines */}
                <li className="flex items-start gap-5 group">
                  <figure className="text-gray-500 group-hover:text-green-500 transition-colors duration-300 mt-1">
                    <Call size="28" variant="Linear" />
                  </figure>
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                      Direct Lines
                    </h3>
                    <a href="tel:+447719746217" className="text-gray-300 text-base md:text-lg hover:text-white transition-colors duration-300">
                      +44 7719 746217
                    </a>
                    <a href="mailto:hello@glitterscleaning.co.uk" className="text-gray-300 text-base md:text-lg hover:text-white transition-colors duration-300">
                      hello@glitterscleaning.co.uk
                    </a>
                  </section>
                </li>

                {/* Operational Hours */}
                <li className="flex items-start gap-5 group">
                  <figure className="text-gray-500 group-hover:text-green-500 transition-colors duration-300 mt-1">
                    <Clock size="28" variant="Linear" />
                  </figure>
                  <section className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500">
                      Dispatch Hours
                    </h3>
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                      Mon – Fri: 06:00 – 20:00 <br />
                      Sat – Sun: By Appointment <br />
                      <span className="text-green-500 text-sm mt-2 block font-medium">24/7 Commercial & Emergency Support Available</span>
                    </p>
                  </section>
                </li>
              </ul>
            </address>

            {/* RIGHT: Inquiry Form */}
            <section className="w-full lg:w-7/12 bg-white p-6 md:p-12 lg:p-24 flex flex-col justify-center border-b lg:border-b-0 border-gray-200">
              <header className="mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                  Book a free clean trial
                </h2>
                <p className="text-gray-500 text-base leading-relaxed">
                  Please provide your details below. A supervisor will review your submission and contact you shortly to coordinate an on-site assessment, ensuring the highest standards of eco-conscious cleaning for your environment.
                </p>
              </header>

              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <fieldset className="flex flex-col gap-6 border-none p-0 m-0">
                  
                  {/* Personal Details Row */}
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold tracking-[0.1em] uppercase text-gray-900">Full Name</span>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sarah Jenkins"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none px-5 py-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white transition-all"
                      />
                    </label>

                    <label className="flex flex-col gap-2">
                      <span className="text-xs font-bold tracking-[0.1em] uppercase text-gray-900">Email Address</span>
                      <input
                        type="email"
                        required
                        placeholder="sarah@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none px-5 py-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white transition-all"
                      />
                    </label>
                  </section>

                  {/* Custom Select for Facility Type */}
                  <label className="flex flex-col gap-2 relative">
                    <span className="text-xs font-bold tracking-[0.1em] uppercase text-gray-900">Facility Type</span>
                    <select
                      required
                      value={form.facilityType}
                      onChange={(e) => setForm({ ...form, facilityType: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none px-5 py-4 text-sm text-gray-900 outline-none focus:border-gray-900 focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled hidden>Select an environment</option>
                      <option value="residential">Private Residential</option>
                      <option value="hmo">HMO (Houses in Multiple Occupation)</option>
                      <option value="care-home">Care Home</option>
                      <option value="school">School / Educational Facility</option>
                      <option value="event-centre">Event Centre</option>
                      <option value="kitchen-tr19">Commercial Kitchen (TR-19 Deep Clean)</option>
                      <option value="other">Other Commercial Space</option>
                    </select>
                    <ArrowDown2 size="16" variant="Linear" className="absolute right-5 bottom-4 text-gray-500 pointer-events-none" />
                  </label>

                  {/* Message Textarea */}
                  <label className="flex flex-col gap-2">
                    <span className="text-xs font-bold tracking-[0.1em] uppercase text-gray-900">Project Scope</span>
                    <textarea
                      required
                      rows={6}
                      placeholder="Provide a brief overview of your spatial requirements, preferred frequency, or any specific compliance needs..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded-none px-5 py-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-900 focus:bg-white transition-all resize-none"
                    />
                  </label>

                </fieldset>
                
                {/* Submit Button */}
                <button 
                  type="submit"
                  className="w-full sm:w-max flex items-center justify-center gap-3 bg-gray-900 hover:bg-green-600 transition-colors duration-300 text-white font-medium py-4 px-10 mt-2"
                >
                  Transmit Inquiry
                  <Send2 size="18" variant="Linear" />
                </button>
                
                <p className="text-gray-400 text-xs mt-2">
                  By submitting this form, you agree to our strict <a href="#" className="underline hover:text-gray-900 transition-colors">confidentiality policy</a>. All data is securely processed.
                </p>
              </form>
            </section>

          </article>
        </section>

      </main>
    </Layout>
  );
};

export default ContactPage;