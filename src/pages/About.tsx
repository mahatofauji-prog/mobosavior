import { WebsiteContent } from '../types';
import { Award, ShieldCheck, Microscope, Cpu, HeartHandshake, Check } from 'lucide-react';

interface AboutProps {
  onNavigate: (route: string) => void;
  content: WebsiteContent;
}

export default function About({ onNavigate, content }: AboutProps) {
  const values = [
    {
      title: 'Microscopic Hardware Precision',
      desc: 'We trace electronic pathways under 40x stereomicroscopes, reballing chips down to 0.3mm ball gaps, ensuring highly precise diagnostics and board saves.',
      icon: <Microscope className="w-5 h-5 text-[#0284C7]" />
    },
    {
      title: 'Component level Board Recovery',
      desc: 'Instead of forcing you to purchase a complete expensive logic board swap, we trace dead shorts, capacitors, and PMICs individually, saving substantial costs.',
      icon: <Cpu className="w-5 h-5 text-[#0284C7]" />
    },
    {
      title: 'Honest Diagnoses & No Playbooks',
      desc: 'We never charge for inspections if we cannot locate the core issue. All assessments are shared with complete transparency prior to micro-soldering.',
      icon: <HeartHandshake className="w-5 h-5 text-[#0284C7]" />
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 text-left">
      {/* Visual Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left text */}
        <div className="lg:col-span-7 space-y-6">
          <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">About Saddam & Team</span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight font-sans">
            Specialized Motherboard Diagnostics in Purulia
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {content.aboutText || 'MOBO SAVIOR is Purulia\'s premier mobile phone service center, specializing in advanced, chip-level hardware diagnostics and repairs.'}
          </p>

          <blockquote className="border-l-4 border-[#0284C7] bg-[#F0F9FF] p-4 rounded-r-xl text-xs sm:text-sm font-bold text-slate-800 leading-relaxed">
            "{content.aboutHighlight || 'We do not just replace parts; we save motherboards. Your trusted choice for premium mobile restorations.'}"
          </blockquote>
        </div>

        {/* Right visual block */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[320px]">
            <div className="absolute inset-0 bg-[#E0F2FE] rounded-3xl transform rotate-3 scale-102 blur-sm -z-10" />
            <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-3.5 select-none">
              <div className="bg-[#0F172A] aspect-[4/5] rounded-2xl p-5 flex flex-col justify-between text-white relative overflow-hidden">
                <span className="text-[9px] font-mono tracking-widest text-slate-400">BENCH SPECIFICATIONS</span>
                
                <div className="space-y-4 my-auto">
                  <div className="flex gap-2.5 items-center">
                    <Microscope className="w-5 h-5 text-sky-400" />
                    <div>
                      <h4 className="text-xs font-bold font-mono">Microscope Zoom</h4>
                      <p className="text-[10px] text-slate-400 font-mono">0.7x - 4.5x Continuous</p>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h4 className="text-xs font-bold font-mono">Infrared Thermal Diagnostic</h4>
                      <p className="text-[10px] text-slate-400 font-mono">Short-circuit Detection</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-2 text-[9px] font-mono text-slate-500">
                  MOBO SAVIOR LAB V1.0
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Philosophy */}
      <div className="space-y-8 border-t border-slate-100 pt-12">
        <div className="max-w-2xl space-y-2">
          <span className="text-[10px] font-bold tracking-widest text-[#0284C7] uppercase font-sans">Our Core Values</span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Our Standards of Work</h2>
          <p className="text-sm text-slate-500">
            We operate in conformity with rigorous procedures, protecting customer devices, data, and circuit traces.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center border border-sky-100">
                {val.icon}
              </div>
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 text-sm font-sans">{val.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {val.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to action card */}
      <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md">
        <div className="space-y-2 max-w-lg">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight font-sans">Experience Transparent Repairs Today</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Bring your dead phone, blackscreen display, or draining battery. Let Saddam Bhai provide a free inspection and precise quote under our microscopic workbench!
          </p>
        </div>
        <button
          onClick={() => onNavigate('book-repair')}
          className="px-6 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-extrabold rounded-xl shadow transition-all flex-shrink-0"
        >
          BOOK A REPAIR APPOINTMENT
        </button>
      </div>
    </div>
  );
}
